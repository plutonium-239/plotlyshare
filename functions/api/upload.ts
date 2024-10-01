import { verifyAndDecodeJWT, type Env } from "./utils";

export const onRequestPost: PagesFunction<Env> = async (context) => {

    const decryptedjwt = await verifyAndDecodeJWT(context.request, context.env.ENCODE_JWT_TOKEN)
    if (decryptedjwt instanceof Response) return decryptedjwt;
    
    const request : Request = context.request
    const data = request.formData
    console.log("received data:", context.data);
    console.log("received form data:", data);


    // const userData: SingleUserData = await makeAPIfetch(
    //     makeRESTdocURL(context.env, "userdata", decryptedjwt.user_id), 
    //     context.env,
    //     {
    //         method: 'POST',
    //         body: data
    //     }
    // )
    // console.log("userData", userData);

    return new Response(
        JSON.stringify({}),
        {
            status: 200,
            headers: {
                'content-type': 'application/json'
            }
        }
    )
}