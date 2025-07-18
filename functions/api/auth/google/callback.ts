import jwt from '@tsndr/cloudflare-worker-jwt';
import { google, type OAuthTokens } from "../../../worker-auth-providers";
import type { Google } from '../../../worker-auth-providers/dist/providers/google';
import { JWT_EXPIRY_TIME, Stats, createFirestoreDocument, drivePutMeta, hashThis, makeAPIfetch, makeRESTdocURL, type BasicProfileInKV, type Env, type ProfileInFirestore } from '../../utils';
import { onRequestGet as redirectRequest } from './redirect';


function generateJWT(rid: string, env: Env) {
    const claims: any = {
        user_id: rid,
    };
    const secret = env.ENCODE_JWT_TOKEN;
    console.log("[claims, secret]", claims, secret);
    return jwt.sign({ exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_TIME, ...claims }, secret, { algorithm: "HS256" });
}


async function createUser(user: Google.CallbackResponse, env: Env, context: EventContext<Env, any, Record<string, unknown>>) {
    // const existing = await makeAPIfetch(makeRESTdocURL(env, 'users', `${user.user.id}`), env)
    const rid = await hashThis(user.user.id)
    const existing = await env.basicprofileKV.get(rid)
    // console.log("existing", existing);

    if (existing) {
        let info = JSON.parse(existing) as BasicProfileInKV
        console.log("Found user with refresh_token", info);
        if (user.tokens.refresh_token) {
            console.log("Updated refresh token", user.tokens.refresh_token);
            info.refresh_token = user.tokens.refresh_token
            return env.basicprofileKV.put(rid, JSON.stringify(info))
        }
        return
    };
    console.log("Did not find user, making new : ", JSON.stringify(user));
    const driveFolderId = await drivePutMeta(
        {
            name: 'PlotlyShare',
            mimeType: 'application/vnd.google-apps.folder'
        },
        user.tokens.access_token,
        { fields: 'id' }
    ) as { id: string }
    console.log("Made drive folder with id", driveFolderId);


    const profile: ProfileInFirestore = {
        provider: "google",
        uuid: rid,
        grantedScopes: user.tokens.scope,
        ...user.user
    }
    const basicProfileForKV: BasicProfileInKV = {
        email: profile.email,
        given_name: profile.given_name,
        picture: profile.picture,
        refresh_token: user.tokens.refresh_token,
        user_gid: user.user.id,
        driveFolderId: driveFolderId.id,
    }
    const existingStats = JSON.parse(await env.basicprofileKV.get('__stats')) ?? {} as Stats
    existingStats.users = (existingStats.users ?? 0) + 1
    const promiseStatsKV = env.basicprofileKV.put('__stats', JSON.stringify(existingStats))

    const promiseRTKV = env.basicprofileKV.put(rid, JSON.stringify(basicProfileForKV))
    const promiseFIRE = makeAPIfetch(
        makeRESTdocURL(env, `users?documentId=${user.user.id}`),
        context,
        {
            method: 'POST',
            body: JSON.stringify(createFirestoreDocument(profile))
        }
    )
    const promiseFIRErootColl = makeAPIfetch(
        makeRESTdocURL(context.env, "userdata", rid),
        context,
        {
            method: 'PATCH',
            body: JSON.stringify(createFirestoreDocument({
                rootCollections: []
            }))
        }
    )

    return Promise.all([promiseStatsKV, promiseRTKV, promiseFIRE, promiseFIRErootColl])
}

export const FIREBASE_CONFIG = (env: Env) => {
    return {
        apiKey: env.FIREBASE_apiKey,
        authDomain: env.FIREBASE_authDomain,
        projectId: env.FIREBASE_projectId,
        storageBucket: env.FIREBASE_storageBucket,
        messagingSenderId: env.FIREBASE_messagingSenderId,
        appId: env.FIREBASE_appId
    }
};

export const onRequest: PagesFunction<Env> = async (context) => {
    try {
        const options = {
            clientId: context.env.GOOGLE_CLIENT_ID,
            clientSecret: context.env.GOOGLE_CLIENT_SECRET,
            redirectUrl: context.env.GOOGLE_REDIRECT_PROD_URL,
        };
        const { request } = context
        // console.log('request', request);
        let existingState = await context.env.basicprofileKV.get('__state')
        if (!existingState) {
            return new Response("Could not find state, please start again", { status: 502 })
        }

        const params = new URLSearchParams(context.request.url.split('?').pop())
        // console.log(context.request.url);
        // console.log(params);

        let token: OAuthTokens | undefined
        if (params.get('state') !== existingState) {
            console.error(`state found: ${params.get('state')} should have been: ${existingState}`);
            return new Response("Bad state parameter", { status: 400 })
        }
        if (params.get('error')) {
            console.error("Google redirect returned error : ", params);
            const code = params.get('code')
            if (code) {
                console.info("can use code to get token");
                console.log("code found", code);
                token = await google.getTokensFromCode(code, options)
                console.log("token", token);
            } else {
                // this always returns at least an access token and a code
                console.info("no code found, redirecting to google");
                // context.env.SHOULD_GOOGLE_PROMPT = "select_account consent"
                context.env.SHOULD_GOOGLE_PROMPT = "consent"
                return redirectRequest(context)
            }
        }

        const user: Google.CallbackResponse = await google.users({
            options,
            request,
        });
        console.log('[user]', user);
        if (!user.tokens && token) {
            user.tokens = token
            console.info('no user.token found; explicitly set user.token to token');
        }

        await createUser(user, context.env, context);

        const jwt = await generateJWT(await hashThis(user.user.id), context.env);
        console.log("[jwt]", jwt);
        const expiry = new Date();
        expiry.setTime(expiry.getTime() + JWT_EXPIRY_TIME * 1000); // 1000 refers to milliseconds
        // expiry.setTime(expiry.getTime() + 10000); // 10 seconds
        return Response.json(
            user,
            {
                status: 302,
                headers: {
                    location: "/",
                    // TODO: make file auth-utils.ts and add cookie/jwt code to that
                    "Set-Cookie": `__Session-worker.auth.providers-token=${jwt}; Secure; HttpOnly; SameSite=Lax; Expires=${expiry.toUTCString()}; path=/;`,
                },
            }
        );
    } catch (e: any) {
        console.log("[error]", e?.stack);
        return Response.redirect('/404', 302)
    }
}