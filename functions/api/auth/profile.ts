import { verifyAndDecodeJWT, hashThis, type BasicProfileInKV, type Env } from '../utils';
import { makeNewCLIToken } from './regen_cli_token';



export const onRequest: PagesFunction<Env> = async (context) => {
    // const app = initializeApp(FIREBASE_CONFIG(context.env))
    // const metadata = getFirestore(app)

    const decryptedjwt = await verifyAndDecodeJWT(context.request, context.env.ENCODE_JWT_TOKEN)
    if (decryptedjwt instanceof Response) return decryptedjwt;

    console.log('decryptedjwt', JSON.stringify(decryptedjwt));

    // const user = (await getDoc(doc(metadata, 'users', decryptedjwt.user_id))).data()
    
    /* {name: string, fields: {[s: string]: any}, createTime: string, updateTime: string} */
    // const userParsed: Google.UserResponse = await makeAPIfetch(
        //     makeRESTdocURL(context.env, "users", decryptedjwt.user_id), 
        //     context.env
        // )
    const uid = await hashThis(decryptedjwt.user_id)
    const profile = await context.env.basicprofileKV.get(uid)
    if (!profile) {
        return new Response(
            "The credentials could not be verified, please log out and log in again.", 
            { status: 401 }
        )
    }
    const userParsed : BasicProfileInKV = JSON.parse(profile)
    let cli_token = await context.env.cli_tokensKV.get(uid)
    if (!cli_token) {
        cli_token = await makeNewCLIToken(context.env, uid)
    }
    
    return new Response(
        JSON.stringify({
            uid: uid,
            name: userParsed.given_name,
            picture: userParsed.picture,
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