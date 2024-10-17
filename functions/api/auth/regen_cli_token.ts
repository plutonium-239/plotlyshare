import { verifyAndDecodeJWT, type Env } from "../utils";

export async function makeNewCLIToken(env: Env, uid: string) {
    const cli_token = crypto.randomUUID()
    // no need to delete old as put overwrites
    await env.cli_tokensKV.put(uid, cli_token)
    console.log("Made new cli_token", cli_token);
    return cli_token
} 

export const onRequest: PagesFunction<Env> = async (context) => {

    const decodedRes = await verifyAndDecodeJWT(context, context.env.ENCODE_JWT_TOKEN)
    if (decodedRes instanceof Response) return decodedRes;
    
    const cli_token = decodedRes.uid

    return new Response(
        JSON.stringify({
            cli_token: cli_token
        }),
        {
            status: 200,
            headers: {
                'content-type': 'application/json'
            }
        }
    )
}