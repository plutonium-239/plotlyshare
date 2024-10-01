import { makeAPIfetch, makeRESTdocURL, verifyAndDecodeJWT, type Env, type UserData } from "./utils";


export const onRequest: PagesFunction<Env> = async (context) => {

    const decryptedjwt = await verifyAndDecodeJWT(context.request, context.env.ENCODE_JWT_TOKEN)
    if (decryptedjwt instanceof Response) return decryptedjwt;
    
    // @ts-expect-error
    const userData: UserData = await makeAPIfetch(
        makeRESTdocURL(context.env, 'userdata', `${decryptedjwt.user_id}`), 
        context.env
    )
    console.log("userData", userData);

    return new Response(
        JSON.stringify(userData),
        {
            status: 200,
            headers: {
                'content-type': 'application/json'
            }
        }
    )
}