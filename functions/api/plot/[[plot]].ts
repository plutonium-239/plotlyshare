import queryString from "query-string";
import { makeAPIfetch, makeRESTdocURL, verifyAndDecodeJWT, type Env, type PlotData, type UserData } from "../utils";
import type { PlotlyDataLayoutConfig } from "plotly.js-dist-min";


export const onRequest: PagesFunction<Env> = async (context) => {
    context.params
    // const params = queryString.parseUrl(context.request.url)
    const params = context.params.plot as string[]
    if (!Array.isArray(params) || params.length !== 2) {
        return new Response(
            "Plot must only be of format api/plot/{userid}/{plotid}",
            {status: 400}
        )
    }
    const userid = params[0]
    const plotid = params[1]

    console.log("Got userid, plotid", userid, plotid);
    
    const data = await makeAPIfetch(
        makeRESTdocURL(context.env, 'userdata', userid, plotid),
        context,
    ) as PlotData
    console.log(data);
    
    if (data.public) {
        const plotjson = await fetch(data.linked_file).then(res => res.text())
        //.then(res => res.json()) as PlotlyDataLayoutConfig
        // TODO: add google drive fetching
        return new Response(
            plotjson,
            {
                status: 200,
                headers: {
                    'content-type': 'application/json'
                }
            }
        )
    }
    return new Response(
        "Could not find resource or resource is not public",
        {
            status: 404,
            headers: {
                location: '/404'
            }
        }
    )
}