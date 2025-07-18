import { google } from "../../../worker-auth-providers";
import { verifyAndDecodeJWT, type Env } from "../../utils";

export const onRequestGet : PagesFunction<Env> = async (context) => {
    console.log(`RECEIVED REDIRECT REQUEST, ${[context.env.SHOULD_GOOGLE_PROMPT]}`);
    
    // const decodedRes = await verifyAndDecodeJWT(context, context.env.ENCODE_JWT_TOKEN)
    // if (!(decodedRes instanceof Response)) {
    //     console.log("Found refresh_token, trying to silentauth")
    //     const refresh_token = decodedRes.basicProfile.refresh_token;
    //     const options = {
    //         clientId: context.env.GOOGLE_CLIENT_ID,
    //         clientSecret: context.env.GOOGLE_CLIENT_SECRET,
    //         redirectUrl: context.env.GOOGLE_REDIRECT_PROD_URL,
    //         grantType: "refresh_token"
    //     };
    //     const token = await google.getTokensFromCode(refresh_token, options)
    //     console.log(token)
    // }


    let state = await context.env.basicprofileKV.get('__state')
    if (!state) {
        state = crypto.randomUUID()
        await context.env.basicprofileKV.put('__state', state, {expirationTtl: 3600})
    }
    // console.log("state is", state);

    const location = await google.redirect({
        options: {
            clientId: context.env.GOOGLE_CLIENT_ID,
            redirectTo: context.env.GOOGLE_REDIRECT_PROD_URL,
            // @ts-ignore because google only expects a single string but the library expects a string[]
            scope: "openid email profile https://www.googleapis.com/auth/drive.file",
            accessType: "offline",
            prompt: context.env.SHOULD_GOOGLE_PROMPT ?? "none",
            state: state
        }
    });
    
    // console.log("redirecting to google..");
    return Response.redirect(location, 302);
}