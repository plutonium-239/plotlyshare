import { verifyAndDecodeJWT, type Env } from "../utils";

export const onRequest: PagesFunction<Env> = async (context) => {

    const decryptedjwt = await verifyAndDecodeJWT(context.request, context.env.ENCODE_JWT_TOKEN)
    if (decryptedjwt instanceof Response) return decryptedjwt;
    
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