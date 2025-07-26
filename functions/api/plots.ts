import { verifyAndDecodeJWT } from "./auth/authutils";
import { makeAPIfetch, makeRESTdocURL, type Env, type UserData } from "./utils";


export const onRequest: PagesFunction<Env> = async (context) => {

    const decodedRes = await verifyAndDecodeJWT(context, context.env.ENCODE_JWT_TOKEN)
    if (decodedRes instanceof Response) return decodedRes;
    const uid = decodedRes.uid

    // console.log("env is");
    // console.log(context.env);

    const plotDataPromise = makeAPIfetch(makeRESTdocURL(context.env, 'userdata', uid, 'plots'), context)
    const collectionsPromise = makeAPIfetch(makeRESTdocURL(context.env, 'userdata', uid, 'collections'), context)
    const rootCollsPromise = makeAPIfetch(makeRESTdocURL(context.env, 'userdata', uid), context)
    const [plots, collections, profile] = await Promise.all([plotDataPromise, collectionsPromise, rootCollsPromise])
    console.log({profile});
    if (profile.rootCollections.length === 0 && Object.keys(collections).length !== 0) {
        console.error("rootCollections length is 0!");
        console.log(collections);
    }
    delete collections.root;
    const userData: UserData = {
        plots: plots,
        collections: collections,
        rootCollections: profile.rootCollections
    }

    // console.log("userData", userData);

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