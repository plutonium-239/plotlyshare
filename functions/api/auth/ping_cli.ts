import { type Env } from "../utils";
import { verifyCLIToken } from "./authutils";

export const onRequest: PagesFunction<Env> = async (context) => {

    const res = await verifyCLIToken(context.request, context.env)
    if (res instanceof Response) return res

    return new Response(
        "Hello from PlotlyShare on cloudflare! 🌥",
        {
            status: 200,
            headers: {
                'content-type': 'application/json'
            }
        }
    )
}