import { verifyAndDecodeJWT, type Env } from "../utils";

export const onRequest: PagesFunction<Env> = async (context) => {

    const authorization = context.request.headers.get('Authorization');
    const uid = context.request.headers.get('px.sh-user');
    const token = authorization?.split('Bearer ')[1];
    console.log("cli ping", uid, authorization);
    if (authorization && token && uid) {
        if (token === await context.env.cli_tokensKV.get(uid)) {
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
    }
    return new Response('Unauthorized', { status: 401 });
}