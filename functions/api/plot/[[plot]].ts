import queryString from "query-string";
import { google } from "../../worker-auth-providers/dist";
import { OAuthTokens } from "../../worker-auth-providers/dist/types";
import { BasicProfileInKV, createFirestoreDocument, driveGet, drivePutMeta, makeAPIfetch, makeRESTdocURL, verifyAndDecodeJWT, verifyCLIToken, type Env, type PlotData } from "../utils";

// ! GET for getting plot data

export const onRequestGet: PagesFunction<Env> = async (context) => {
    let requesterUID: string
    let t0 = performance.now()
    try {
        const decodedRes = await verifyAndDecodeJWT(context, context.env.ENCODE_JWT_TOKEN)
        if (! (decodedRes instanceof Response)) requesterUID = decodedRes.uid
    } catch {
        requesterUID = null
    }
    let t1 = performance.now()
    console.log("JWT verification took", t1-t0, "ms");
    
    
    const params = context.params.plot as string[]
    if (!Array.isArray(params) || params.length !== 2) {
        return new Response(
            "Plot request must only be of format api/plot/{userid}/{plotid}",
            {status: 400}
        )
    }
    const userid = params[0]
    const plotid = params[1]
    let t2 = performance.now()
    console.log("userid, plotid extracted in", t2-t1, "ms");
    

    // console.log("Got userid, plotid", userid, plotid);
    
    const data = await makeAPIfetch(
        makeRESTdocURL(context.env, 'userdata', userid, 'plots', plotid),
        context,
    ) as PlotData
    // console.log(data);
    let t3 = performance.now()
    console.log("metadata get took", t3-t2, "ms");

    if (data.public || userid === requesterUID) {
        const userParsed = await context.env.basicprofileKV.get(userid).then(res => JSON.parse(res)) as BasicProfileInKV
        let t4 = performance.now()
        console.log("getting user data took", t4-t3, "ms");
        
        const accessToken: OAuthTokens = await google.getTokensFromCode(userParsed.refresh_token,
            {
                clientId: context.env.GOOGLE_CLIENT_ID,
                clientSecret: context.env.GOOGLE_CLIENT_SECRET,
                // @ts-expect-error
                grantType: "refresh_token"
            }
        )
        let t5 = performance.now()
        console.log("getting user access_token took", t5-t4, "ms");

        const plotjson = await driveGet(data.linked_file.split('/').pop(), accessToken.access_token)
        let t6 = performance.now()
        console.log("getting plot from user drive took", t6-t5, "ms");

        // console.log("plotjson received");
        // console.log(plotjson);
        // console.log("body");
        // console.log(plotjson);
        const headersToSend = new Headers()
        headersToSend.set('PlotlyShare-plot-Name', data.name)
        headersToSend.set('PlotlyShare-plot-Timestamp', data.timestamp.toString())
        headersToSend.set('content-type', 'application/json')
        headersToSend.set("Cache-Control", `max-age=${30*24*3600}`);
        // console.log("headers", headersToSend);
        
        // const plotjson = await fetch(data.linked_file).then(res => res.text())
        // const [gotocache, gotoresp] = plotjson.body.tee()
        // await cache.put(cacheKey, new Response(
        //     gotocache,
        //     {
        //         status: 200,
        //         headers: headersToSend
        //     }
        // ))
        return new Response(
            plotjson.body,
            {
                status: 200,
                headers: headersToSend,
                // cf: {
                //     cacheTtl: 30*24*3600,
                //     cacheEverything: true
                // }
            }
        )
    }
    return new Response(
        "Could not find resource or resource is not public",
        {
            status: 302,
            headers: {
                location: '/#/404'
            }
        }
    )
}

// ! PATCH for editing metadata (cannot edit plot itself)

export const onRequestPatch: PagesFunction<Env> = async (context) => {
    let t0 = performance.now()
    const request : Request = context.request
    let requesterUID: string
    try {
        const decodedRes = await verifyAndDecodeJWT(context, context.env.ENCODE_JWT_TOKEN)
        if (decodedRes instanceof Response) return decodedRes 
        requesterUID = decodedRes.uid
    } catch {
        return new Response("You are not logged in", {status: 401})
    }
    let t1_0 = performance.now()
    console.log("JWT verification took", t1_0-t0, "ms");

    const params = context.params.plot as string[]
    if (!Array.isArray(params) || params.length !== 2) {
        return new Response(
            "Plot request must only be of format api/plot/{userid}/{plotid}",
            {status: 400}
        )
    }
    const userid = params[0]
    const plotid = params[1]

    if (userid !== requesterUID) return new Response("Cannot delete someone else's plots", {status: 403})

    type Update = {
        name?: string,
        public?: boolean,
    }
    const updates: Update = await request.json()

    const user = await context.env.basicprofileKV.get(requesterUID)
    const userParsed : BasicProfileInKV = JSON.parse(user)
    
    const accessToken: OAuthTokens = await google.getTokensFromCode(userParsed.refresh_token, 
        {
            clientId: context.env.GOOGLE_CLIENT_ID,
            clientSecret: context.env.GOOGLE_CLIENT_SECRET,
            // @ts-expect-error
            grantType: "refresh_token"
        }
    )
    const plot: PlotData = await makeAPIfetch(makeRESTdocURL(context.env, "userdata", requesterUID, 'plots', plotid), context) as PlotData
   
    if (updates.name) {
        const fileMetadata = {
            name: `${plotid}-${updates.name}.json`,
            parents: [userParsed.driveFolderId],
            mimeType: 'application/json'
        }
        
        console.log("Sending drive request", plotid, updates.name);
        await driveGet(plot.linked_file, accessToken.access_token, 'PATCH', JSON.stringify(fileMetadata))
    }
        
    const plotlyshareMetadata: {[k: string]: any} = {}
    if (updates.name) plotlyshareMetadata.name = updates.name;
    if (updates.public) plotlyshareMetadata.public = updates.public;
    console.log("Plot metadata", {plotlyshareMetadata, id: plotid});
       
    const qstr = queryString.stringify({'updateMask.fieldPaths': Object.keys(plotlyshareMetadata)})
    const plotUploaded = await makeAPIfetch(
        makeRESTdocURL(context.env, "userdata", requesterUID, 'plots',
            `${plotid}?${qstr}`),
        context,
        {
            method: 'PATCH',
            body: JSON.stringify(createFirestoreDocument(plotlyshareMetadata))
        }
    )
    
    console.log("userData", plotUploaded);

    return new Response(
        "success",
        {
            status: 200,
        }
    )
}

// ! DELETE for deleting plot

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    let t0 = performance.now()
    let requesterUID: string
    try {
        const decodedRes = await verifyAndDecodeJWT(context, context.env.ENCODE_JWT_TOKEN)
        if (decodedRes instanceof Response) return decodedRes 
        requesterUID = decodedRes.uid
    } catch {
        return new Response("You are not logged in", {status: 401})
    }
    let t1_0 = performance.now()
    console.log("JWT verification took", t1_0-t0, "ms");

    const params = context.params.plot as string[]
    if (!Array.isArray(params) || params.length !== 2) {
        return new Response(
            "Plot request must only be of format api/plot/{userid}/{plotid}",
            {status: 400}
        )
    }
    const userid = params[0]
    const plotid = params[1]
    if (userid !== requesterUID) return new Response("Cannot delete someone else's plots", {status: 403})

    const user = await context.env.basicprofileKV.get(requesterUID)
    const userParsed : BasicProfileInKV = JSON.parse(user)
    
    const accessToken: OAuthTokens = await google.getTokensFromCode(userParsed.refresh_token, 
        {
            clientId: context.env.GOOGLE_CLIENT_ID,
            clientSecret: context.env.GOOGLE_CLIENT_SECRET,
            // @ts-expect-error
            grantType: "refresh_token"
        }
    )
    const plot = await makeAPIfetch(makeRESTdocURL(context.env, "userdata", requesterUID, 'plots', plotid), context) as PlotData
   
    console.log("trying request to delete plot", plotid, plot.name, "with drive ID", plot.linked_file);
    
    const drivePromise = driveGet(plot.linked_file, accessToken.access_token, 'DELETE')
    
    const firestorePromise = makeAPIfetch(
        makeRESTdocURL(context.env, "userdata", requesterUID, 'plots', plotid),
        context,
        {
            method: 'DELETE'
        }
    )
    const [res, deleteres] = await Promise.all([drivePromise, firestorePromise])
    console.log("drive delete response", res);
    console.log("firestore delete response", deleteres);

    return new Response(
        "success",
        {
            status: 200,
        }
    )
}
