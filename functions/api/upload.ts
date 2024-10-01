import type { PlotlyDataLayoutConfig } from "plotly.js-dist-min";
import { verifyCLIToken, type Env } from "./utils";

export type PlotFormData = {
    plot_data: PlotlyDataLayoutConfig,
    name: string,
    timestamp: number,
    time: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {

    const request : Request = context.request
    const res = await verifyCLIToken(request, context.env)
    if (res instanceof Response) return res
    
    const data = await request.formData()
    // console.log("received data:", JSON.stringify(context.data));
    console.log("received form data:", data);
    console.log("received form data:", JSON.stringify(data));

    for (const [key, value] of data.entries()) {
        console.log(`${key}: ${value}`);
    }

    
    // console.log("received plot keys:", data as PlotFormData);

    // const userData: SingleUserData = await makeAPIfetch(
    //     makeRESTdocURL(context.env, "userdata", decryptedjwt.user_id), 
    //     context.env,
    //     {
    //         method: 'POST',
    //         body: data
    //     }
    // )
    // console.log("userData", userData);

    return new Response(
        JSON.stringify({}),
        {
            status: 200,
            headers: {
                'content-type': 'application/json'
            }
        }
    )
}