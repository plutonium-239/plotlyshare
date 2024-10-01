import { google } from "../../../worker-auth-providers";
import type { Env } from "../../utils";


export const onRequestGet : PagesFunction<Env> = async (context) => {
    console.log("RECEIVED REDIRECT REQUEST");
    
    try {
        let state = await context.env.basicprofileKV.get('__state')
        if (!state) {
            state = crypto.randomUUID()
            await context.env.basicprofileKV.put('__state', state, {expirationTtl: 3600})
        }
        console.log("context.env is");
        console.log(context.env);
        

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
        return new Response(
            null,
            {
                status: 302,
                headers: {
                    location: location,
                },
            }
        ) 
    } catch (e: any) {
        return new Response(
            JSON.stringify({
                error: 'Invalid request',
                message: `${e.message}`
            }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            }
        )
    }
}