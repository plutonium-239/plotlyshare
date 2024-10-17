import { google } from "../../worker-auth-providers/dist";
import { OAuthTokens } from "../../worker-auth-providers/dist/types";
import { BasicProfileInKV, CollectionData, driveGet, makeAPIfetch, makeRESTdocURL, verifyAndDecodeJWT, type Env, type PlotData } from "../utils";


export const onRequest: PagesFunction<Env> = async (context) => {
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

    
    const params = context.params.collection as string[]
    if (!Array.isArray(params) || params.length !== 2) {
        return new Response(
            "Plot request must only be of format api/plot/{userid}/{plotid}",
            {status: 400}
        )
    }
    const userid = params[0]
    const collid = params[1]
    let t2 = performance.now()
    console.log("userid, plotid extracted in", t2-t1, "ms");
    

    // console.log("Got userid, plotid", userid, plotid);
    
    const data = await makeAPIfetch(
        makeRESTdocURL(context.env, 'userdata', userid, 'collection', collid),
        context,
    ) as CollectionData
    // console.log(data);
    let t3 = performance.now()
    console.log("metadata get took", t3-t2, "ms");

    if (data.public || userid === requesterUID) {
        return new Response(
            JSON.stringify(data),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': `max-age=${30*24*3600}`
                }
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