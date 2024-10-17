import type { PlotlyDataLayoutConfig } from "plotly.js-dist-min";
import { BasicProfileInKV, CollectionData, PlotData, createFirestoreDocument, drivePutMultipart, hashThis, makeAPIfetch, makeRESTdocURL, verifyAndDecodeJWT, verifyCLIToken, type Env } from "./utils";
import { OAuthTokens, google } from "../worker-auth-providers/dist";
import { makeNewCollection } from "./newcollection";
import { unzipSync } from "fflate";
import { PlotFormData } from "./upload";

export const onRequestPost: PagesFunction<Env> = async (context) => {
    let t0 = performance.now()
    const request : Request = context.request
    let uid: string | Response
    if (request.headers.has('Authorization')) {
        console.log("Authorization header found, using CLI auth");
        uid = await verifyCLIToken(request, context.env)
        if (uid instanceof Response) return uid
    } else {
        console.log("Authorization header NOT found, using JWT auth");
        const decodedRes = await verifyAndDecodeJWT(context, context.env.ENCODE_JWT_TOKEN)
        if (decodedRes instanceof Response) return decodedRes;
        uid = decodedRes.uid
    }
    let t1_0 = performance.now()
    console.log("CLI verification took", t1_0-t0, "ms");

    const formdata = await request.formData()
    
    // for (const [key, value] of data.entries()) {
    //     console.log(`${key}: ${value}`);
    // }

    type zipUpload = {
        zipped: Blob,
        collection?: CollectionData & {id: string, parent?: string},
        plots: {[plotkey: string] : PlotFormData}
    }
    const form = Object.fromEntries(formdata.entries())
    const data: zipUpload = {
        zipped: form.zipped as Blob,
        collection: form.collection ? JSON.parse(form.collection as string) : undefined,
        plots: JSON.parse(form.plots as string)
    }
    
    if (data.collection) {
        let collid = await fetch('https://uuid.rocks/short').then(res => res.text())
        data.collection.id = collid
    }
    let plotIDs: string[] = []
    
    console.log("parsed data:");
    console.log(data);
    let t1_1 = performance.now()
    console.log("Data parsing took", t1_1-t1_0, "ms");

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
    let t1_2 = performance.now()
    console.log("token refresh took", t1_2-t1_1, "ms");
    
    // ! unzip data.zipped and iterate using the data.plots object
    const unzipped = unzipSync(new Uint8Array(await data.zipped.arrayBuffer()))
    const decoder = new TextDecoder()

    let t1 = performance.now()
    console.log("unzip took", t1-t1_2, "ms");
    
    let promises = Object.entries(data.plots).map(async ([plotkey, plot]) => {
        const plotID = await hashThis(JSON.stringify(plot))
        plotIDs.push(plotID)
        const plot_data = decoder.decode(unzipped[`${plotkey}.json`])

        if (!plot.time) {
            plot.time = Date.now().toString()
        }

        console.log("Iterating on plot", plotkey);
        
        const fileMetadata = {
            name: `${plotID}-${plot.name}.json`,
            // timestamp: plot.timestamp,
            createdTime: plot.time,
            parents: [userParsed.driveFolderId],
            mimeType: 'application/json'
        }
        
        const opts = {fields: 'id', uploadType: 'multipart'}
        console.log("Sending drive request", plotkey);
        const uploadRes = await drivePutMultipart(fileMetadata, plot_data, accessToken.access_token, opts) as {id:string}
        console.log("Upload response");
        console.log(uploadRes);
        let t2 = performance.now()
        console.log("Drive upload took", t2-t1, "ms");
    
        const plotlyshareMetadata: PlotData = {
            public: false,
            name: plot.name,
            time_created: plot.time,
            timestamp: parseInt(plot.timestamp),
            linked_file: `drive/${uploadRes.id}`
        }
        console.log("Plot metadata", plotlyshareMetadata);

        // OPTIMIZE: Switch this to batchWrites (pro: less requests, con: very bad/confusing request structure)
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
    })
    await Promise.all(promises)

      
    if (data.collection) {
        // ! make new collection
        data.collection.members = plotIDs
        data.collection.subcollections = []
        let collRes = await makeNewCollection(context, data.collection, uid)
    }

    let t4 = performance.now()
    console.log("Everything took", t4-t1, "ms");


    return new Response(
        JSON.stringify({
            key: `${uid}/${data.collection.id}`
        }),
        {
            status: 200,
            headers: {
                'content-type': 'application/json'
            }
        }
    )
}