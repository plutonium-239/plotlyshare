import type { PlotlyDataLayoutConfig } from "plotly.js-dist-min";
import { BasicProfileInKV, CollectionData, DocumentFields, PlotData, UserData, createFirestoreDocument, drivePutMeta, drivePutMultipart, hashThis, makeAPIfetch, makeRESTdocURL, verifyAndDecodeJWT, verifyCLIToken, type Env } from "./utils";
import { OAuthTokens, google } from "../worker-auth-providers/dist";


export const onRequestPost: PagesFunction<Env> = async (context) => {
    let t0 = performance.now()
    const request : Request = context.request

    let uid: string | Response
    if (request.headers.has('Authorization')) {
        console.log("Authorization header found, using CLI auth");
        uid = await verifyCLIToken(request, context.env)
        if (uid instanceof Response) return uid
    } else {
        console.log("Authorization header NOT found, using JWT auth");
        const decryptedjwt = await verifyAndDecodeJWT(context.request, context.env.ENCODE_JWT_TOKEN)
        if (decryptedjwt instanceof Response) return decryptedjwt;
        uid = await hashThis(decryptedjwt.user_id)
    }
    
    let t1_0 = performance.now()
    console.log("Auth took", t1_0-t0, "ms");
    

    // const data = await request.formData()
    const collection: CollectionData & {id: string, parent?: string} = await request.json()
    
    console.log("parsed collection:");
    console.log(collection);

    let t1_1 = performance.now()
    console.log("Plot parsing took", t1_1-t1_0, "ms");
    
    const user = await context.env.basicprofileKV.get(uid)
    const userParsed : BasicProfileInKV = JSON.parse(user)
    
    const accessToken: OAuthTokens = await google.getTokensFromCode(userParsed.refresh_token, 
        {
            clientId: context.env.GOOGLE_CLIENT_ID,
            clientSecret: context.env.GOOGLE_CLIENT_SECRET,
            // @ts-expect-error
            grantType: "refresh_token"
        }
    )
    // console.log("userParsed");
    // console.log(userParsed);
    let t1 = performance.now()
    console.log("token refresh took", t1-t1_1, "ms");
    
    
    // const fileMetadata = {
    //     name: `${collection.id}-${collection.name}.json`,
    //     parents: [userParsed.driveFolderId],
    //     mimeType: 'application/json'
    // }
    
    // const opts = {fields: 'id', uploadType: 'multipart'}
    // const uploadRes = await drivePutMultipart(fileMetadata, JSON.stringify(collection), accessToken.access_token, opts) as {id:string}
    // console.log("Upload response");
    // console.log(uploadRes);
    let t2 = performance.now()
    // console.log("Drive upload took", t2-t1, "ms");

    const plotlyshareMetadata = {
        public: false,
        name: collection.name as string,
        members: collection.members as string[],
        subcollections: collection.subcollections as string[]
    }
    console.log("Plot metadata", plotlyshareMetadata);
       
    let parentUpload: Promise<DocumentFields>
    if (collection.parent) {
        const parentData = await makeAPIfetch(
            makeRESTdocURL(context.env, "userdata", uid, 'collections', collection.parent),
            context,
        ) as CollectionData
        const updateMask = {"fieldPaths": ["subcollections"]}
        parentUpload = makeAPIfetch(
            makeRESTdocURL(context.env, "userdata", uid, 'collections', 
                `${collection.parent}?updateMask=${JSON.stringify(updateMask)}`),
            context,
            {
                method: 'PATCH',
                body: JSON.stringify(createFirestoreDocument({
                    subcollections: [...parentData.subcollections, collection.id]
                }))
            }
        )
    } else {
        const parentData = await makeAPIfetch(
            makeRESTdocURL(context.env, "userdata", uid),
            context,
        ) as UserData // not really, just the rootCollections
        console.log({parentData});
        console.log('rootCollections', parentData.rootCollections);
        
        const newRootc = JSON.stringify(createFirestoreDocument({
            rootCollections: [...parentData.rootCollections, collection.id]
        }))
        console.log({newRootc});
        
        parentUpload = makeAPIfetch(
            makeRESTdocURL(context.env, "userdata", uid),
            context,
            {
                method: 'PATCH',
                body: newRootc
            }
        )
    }
    const collUpload = makeAPIfetch(
        makeRESTdocURL(context.env, "userdata", uid, `collections?documentId=${collection.id}`),
        context,
        {
            method: 'POST',
            body: JSON.stringify(createFirestoreDocument(plotlyshareMetadata))
        }
    )
    let res = await Promise.all([collUpload, parentUpload])
    
    console.log("results", res);
    let t3 = performance.now()
    console.log("Firestore Metadata upload took", t3-t2, "ms");
    return new Response(
        JSON.stringify({
            key: `${uid}/${collection.id}`
        }),
        {
            status: 200,
            headers: {
                'content-type': 'application/json'
            }
        }
    )
}