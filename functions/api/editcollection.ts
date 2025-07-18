import { createFirestoreDocument, makeAPIfetch, makeRESTdocURL, verifyCLIToken, type Env } from "./utils";

export type PlotFormData = {
    plot_data: string,
    name: string,
    timestamp: string,
    time: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    let t0 = performance.now()
    const request : Request = context.request
    const uid = await verifyCLIToken(request, context.env)
    if (uid instanceof Response) return uid
    let t1_0 = performance.now()
    console.log("CLI verification took", t1_0-t0, "ms");

    // TODO: add delete parameter
    type Update = {
        collid: string, // cant be updated, just identifies
        name?: string,
        public?: boolean,
        members?: string[],
        subcollections?: string[]
    }
    const updates: Update = await request.json()
   
    const plotlyshareMetadata = {
        public: updates.public,
        name: updates.name,
        members: updates.members,
        subcollections: updates.subcollections, 
    }
    console.log("Plot metadata", plotlyshareMetadata);
       
    const updateMask = {'fieldPaths': [Object.keys(plotlyshareMetadata)]}
    const plotUploaded = await makeAPIfetch(
        makeRESTdocURL(context.env, "userdata", uid, 'collections',
            `${updates.collid}?updateMask=${JSON.stringify(updateMask)}`),
        context,
        {
            method: 'PATCH',
            body: JSON.stringify(createFirestoreDocument(plotlyshareMetadata))
        }
    )
    console.log("userData", plotUploaded);

    return new Response(
        "success",
        {
            status: 200,
        }
    )
}