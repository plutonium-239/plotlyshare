import jwt from '@tsndr/cloudflare-worker-jwt';
import { BasicProfileInKV, hashThis, type Env } from '../utils';
import queryString from "query-string";

function generateJWT(rid: string, env: Env) {
    const claims: any = {
        user_id: rid,
    };
    const secret = env.ENCODE_JWT_TOKEN;
    console.log("[claims, secret]", claims, secret);
    return jwt.sign({ exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_TIME, ...claims }, secret, { algorithm: "HS256" });
}

/**
 * make a cookie string with a signed jwt and expiry `JWT_EXPIRY_TIME` from now 
 * @param rid 
 * @param env 
 * @returns the cookie string
 */
export async function makeCookie(rid: string, env: Env): Promise<string> {
    const jwt = await generateJWT(rid, env);
    console.log("[jwt]", jwt);
    const expiry = new Date();
    expiry.setTime(expiry.getTime() + JWT_EXPIRY_TIME * 1000); // 1000 refers to milliseconds
    // expiry.setTime(expiry.getTime() + 10000); // 10 seconds
    return `__Session-worker.auth.providers-token=${jwt}; Secure; HttpOnly; SameSite=Lax; Expires=${expiry.toUTCString()}; path=/;`
}

type DecryptedJWT = {
    exp: string,
    iat: string,
    user_id: string
}

// export const JWT_EXPIRY_TIME = 60
export const JWT_EXPIRY_TIME = 7*24*3600

export async function verifyAndDecodeJWT(
    context: EventContext<Env, any, Record<string, unknown>>,
    secret: string
): Promise<Response | { uid: string, basicProfile: BasicProfileInKV, exp: number }> {
    const request = context.request
    const signedjwt = request.headers.get('Cookie')?.split('; ').
        find(c => c.startsWith('__Session-worker.auth.providers-token='))?.split("=")[1]

    console.log('signedjwt', signedjwt);
    // TODO split OR, handle each with different response
    if (signedjwt === undefined) {
        return Response.json(
            { error: "No credentials were provided, please log in." },
            { status: 401 }
        )
    } else if (! await jwt.verify(signedjwt, secret)) {
        return Response.json(
            { error: "The credentials could not be verified, please log in again." },
            { status: 401 }
        )
    }
    // @ts-expect-error
    let decryptedjwt = jwt.decode(signedjwt).payload! as DecryptedJWT
    let exp = parseInt(decryptedjwt.exp)
    if (exp <= Date.now() / 1000) {
        return Response.json(
            { error: "Your credentials have expired, please log in again." },
            { status: 401 }
        )
    }
    let uid = decryptedjwt.user_id
    let basicProfile: BasicProfileInKV = JSON.parse(await context.env.basicprofileKV.get(uid))
    if (!basicProfile) {
        return Response.json(
            { error: "Unknown user." },
            { status: 401 }
        )
    }
    return { uid, basicProfile, exp }
}

export async function verifyCLIToken(request: Request, env: Env) {
    const authorization = request.headers.get('Authorization');
    const uid = queryString.parseUrl(request.url).query.user as string | null
    const token = authorization?.split('Bearer ')[1];
    console.log("cli ping", uid, authorization);
    if (authorization && token && uid) {
        const correct = await env.cli_tokensKV.get(uid);
        if (token === correct) {
            return uid
        }
        console.error("should have been", correct)
    }
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
}