import { google } from "../../worker-auth-providers/dist";
import { OAuthTokens } from "../../worker-auth-providers/dist/types";
import { BasicProfileInKV, driveGet, hashThis, makeAPIfetch, makeRESTdocURL, verifyAndDecodeJWT, type Env, type PlotData, type UserData } from "../utils";


export const onRequest: PagesFunction<Env> = async (context) => {
    let requesterUID: string
    let t0 = performance.now()
    try {
        const decryptedjwt = await verifyAndDecodeJWT(context.request, context.env.ENCODE_JWT_TOKEN)
        if (! (decryptedjwt instanceof Response)) requesterUID = await hashThis(decryptedjwt.user_id)
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