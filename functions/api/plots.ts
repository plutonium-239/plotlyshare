import { hashThis, makeAPIfetch, makeRESTdocURL, verifyAndDecodeJWT, type Env, type UserData } from "./utils";


export const onRequest: PagesFunction<Env> = async (context) => {

    const decryptedjwt = await verifyAndDecodeJWT(context.request, context.env.ENCODE_JWT_TOKEN)
    if (decryptedjwt instanceof Response) return decryptedjwt;
    const uid = await hashThis(decryptedjwt.user_id)

    const plotDataPromise = makeAPIfetch(makeRESTdocURL(context.env, 'userdata', uid, 'plots'), context)
    const collectionsPromise = makeAPIfetch(makeRESTdocURL(context.env, 'userdata', uid, 'collections'), context)
    const [plots, collections] = await Promise.all([plotDataPromise, collectionsPromise])
    const userData: UserData = {
        plots: plots,
        collections: collections
    }

    console.log("userData", userData);

    // TODO: Return correct stuff
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