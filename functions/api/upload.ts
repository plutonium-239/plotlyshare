import type { PlotlyDataLayoutConfig } from "plotly.js-dist-min";
import { BasicProfileInKV, PlotData, createFirestoreDocument, drivePutMeta, drivePutMultipart, hashThis, makeAPIfetch, makeRESTdocURL, verifyCLIToken, type Env } from "./utils";
import { OAuthTokens, google } from "../worker-auth-providers/dist";

export type PlotFormData = {
    plot_data: PlotlyDataLayoutConfig,
    name: string,
    timestamp: number,
    time: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    let t0 = performance.now()
    const request : Request = context.request
    const uid = await verifyCLIToken(request, context.env)
    if (uid instanceof Response) return uid
    let t1_0 = performance.now()
    console.log("CLI verification took", t1_0-t0, "ms");

    const data = await request.formData()
    
    // for (const [key, value] of data.entries()) {
    //     console.log(`${key}: ${value}`);
    // }

    const plot = Object.fromEntries(data.entries())

    
    // console.log("parsed plot:");
    // console.log(plot);
    let t1_1 = performance.now()
    console.log("Plot parsing took", t1_1-t1_0, "ms");
    
    const user = await context.env.basicprofileKV.get(uid)
    const userParsed : BasicProfileInKV = JSON.parse(user)
    
    const accessToken: OAuthTokens = await google.getTokensFromCode(userParsed.refresh_token, 
        {
            clientId: context.env.GOOGLE_CLIENT_ID,
            clientSecret: context.env.GOOGLE_CLIENT_SECRET,
            // @ts-expect-error
            grantType: "refresh_token"
        }
    )
    // console.log("userParsed");
    // console.log(userParsed);
    let t1 = performance.now()
    console.log("token refresh took", t1-t1_1, "ms");
    

    const plotID = await hashThis(JSON.stringify(plot))
    
    const fileMetadata = {
        name: `${plotID}-${plot.name}.json`,
        // timestamp: plot.timestamp,
        createdTime: plot.time,
        parents: [userParsed.driveFolderId],
        mimeType: 'application/json'
    }
    
    console.log(typeof plot.plot_data);
    const opts = {fields: 'id', uploadType: 'multipart'}
    const uploadRes = await drivePutMultipart(fileMetadata, plot.plot_data as string, accessToken.access_token, opts) as {id:string}
    console.log("Upload response");
    console.log(uploadRes);
    let t2 = performance.now()
    console.log("Drive upload took", t2-t1, "ms");

    const plotlyshareMetadata: PlotData = {
        public: false,
        name: plot.name as string,
        time_created: plot.time as string,
        timestamp: parseInt(plot.timestamp as string),
        linked_file: `drive/${uploadRes.id}`
    }
    console.log("Plot metadata", plotlyshareMetadata);
       
    const plotUploaded = await makeAPIfetch(
        makeRESTdocURL(context.env, "userdata", uid, `plots?documentId=${plotID}`),
        context,
        {
            method: 'POST',
            body: JSON.stringify(createFirestoreDocument(plotlyshareMetadata))
        }
    )
    console.log("userData", plotUploaded);
    let t3 = performance.now()
    console.log("Firestore Metadata upload took", t3-t2, "ms");

    return new Response(
        JSON.stringify({
            key: `${uid}/${plotID}`,
            sent_bytes: (plot.plot_data as string).length
        }),
        {
            status: 200,
            headers: {
                'content-type': 'application/json'
            }
        }
    )
}