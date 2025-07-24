import { google } from '../../worker-auth-providers';
import { JWT_EXPIRY_TIME, verifyAndDecodeJWT, type BasicProfileInKV, type Env } from '../utils';
import { makeNewCLIToken } from './regen_cli_token';
import { relativeTimeFromElapsed } from '../../../src/lib/timehelper'

export const onRequest: PagesFunction<Env> = async (context) => {
    // const app = initializeApp(FIREBASE_CONFIG(context.env))
    // const metadata = getFirestore(app)

    const decodedRes = await verifyAndDecodeJWT(context, context.env.ENCODE_JWT_TOKEN)
    if (decodedRes instanceof Response) return decodedRes;

    // console.log('decodedRes', JSON.stringify(decodedRes));

    // const user = (await getDoc(doc(metadata, 'users', decodedRes.user_id))).data()

    /* {name: string, fields: {[s: string]: any}, createTime: string, updateTime: string} */
    // const userParsed: Google.UserResponse = await makeAPIfetch(
    //     makeRESTdocURL(context.env, "users", decodedRes.user_id), 
    //     context.env
    // )
    const uid = decodedRes.uid
    const profile = decodedRes.basicProfile
    if (!profile) {
        return Response.json(
            { error: "The credentials could not be verified, please log out and log in again." },
            { status: 401 }
        )
    }

    const delta = decodedRes.exp * 1000 - Date.now();
    console.log(`Provided jwt expires ${relativeTimeFromElapsed(delta)}`);

    if (delta / 1000 < 24 * 3600) {
        console.log(`   Trying to silent-auth and renew`)

        const refresh_token = decodedRes.basicProfile.refresh_token;
        const options = {
            clientId: context.env.GOOGLE_CLIENT_ID,
            clientSecret: context.env.GOOGLE_CLIENT_SECRET,
            redirectUrl: context.env.GOOGLE_REDIRECT_PROD_URL,
            grantType: "refresh_token"
        };
        // .then because dont need to wait here
        const token = google.getTokensFromCode(refresh_token, options).then(() => {
            console.log(`   re-auth success, [token]: ${token}`)
        })

    }

    let cli_token = await context.env.cli_tokensKV.get(uid)
    if (!cli_token) {
        cli_token = await makeNewCLIToken(context.env, uid)
    }
    console.log(profile.refresh_token)

    return Response.json(
        {
            uid: uid,
            name: profile.given_name,
            picture: profile.picture,
            cli_token: cli_token
        },
        {
            status: 200,
            headers: {
                'content-type': 'application/json',
                // 'Cache-Control': `max-age=${3600}`
            }
        }
    )
}