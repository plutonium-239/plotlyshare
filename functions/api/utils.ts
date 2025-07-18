import { getAccessToken } from "web-auth-library/google";
import type { Google } from "../worker-auth-providers/dist/providers/google/types";
import jwt from '@tsndr/cloudflare-worker-jwt';
import queryString from "query-string";
import { error } from "itty-router";

export interface Env {
    GOOGLE_CLIENT_ID: string,
    GOOGLE_CLIENT_SECRET: string,
    GOOGLE_REDIRECT_PROD_URL: string,
    ENCODE_JWT_TOKEN: string,
    FIREBASE_apiKey: string,
    FIREBASE_authDomain: string,
    FIREBASE_projectId: string,
    FIREBASE_storageBucket: string,
    FIREBASE_messagingSenderId: string,
    FIREBASE_appId: string,
    GOOGLE_CLOUD_CREDENTIALS: string,
    SHOULD_GOOGLE_PROMPT?: string,
    basicprofileKV: KVNamespace,
    cli_tokensKV: KVNamespace
}

export type BasicProfileInKV = {
    email: string,
    given_name: string,
    picture: string,
    refresh_token: string,
    user_gid: string,
    driveFolderId: string,
}

export interface ProfileInFirestore extends Google.UserResponse {
    provider: string,
    uuid: string,
    grantedScopes: string,
}

export type PlotData = {
    public: boolean
    name: string
    time_created: string
    timestamp: number
    linked_file: string
}

export type CollectionData = {
    public: boolean,
    name: string,
    members: string[] // plots only
    subcollections: string[]
}

export type UserData = {
    collections: {  // is a firestore collection
        [collectionID: string]: CollectionData
    }
    rootCollections: string[],  // is a FIELD on the useruid document itself
    plots: {    // is a firestore collection
        [plotID: string]: PlotData
    }
}

export type Stats = {
    users: number,
    plots: number,
}

type DecryptedJWT = {
    exp: string,
    iat: string,
    user_id: string
}

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
    if (!signedjwt || (! await jwt.verify(signedjwt, secret))) {
        return Response.json(
            { error: "The credentials could not be verified, please log out and log in again." },
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

const encoder = new TextEncoder()
export async function hashThis(s: string, alg: AlgorithmIdentifier = 'SHA-256') {
    let hashBuffer = await crypto.subtle.digest(alg, encoder.encode(s))
    return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).slice(0, 16).join("")
}


// firestore rest api helpers
const firebase_url = "https://firestore.googleapis.com/v1"
export function makeRESTdocURL(env: Env, ...locs: string[]) {
    return `${firebase_url}/projects/${env.FIREBASE_projectId}/databases/(default)/documents/${locs.join('/')}`
}

export type FirestoreField = {
    stringValue?: string;
    integerValue?: number;
    booleanValue?: boolean;
    timestampValue?: string;
    arrayValue?: { values: FirestoreField[] };
    mapValue?: { fields: { [key: string]: FirestoreField } };
};
export type DocumentFields = { [s: string]: any }


export function coreCoverterFromDoc(field: FirestoreField) {
    if (field.stringValue !== undefined) {
        return field.stringValue;
    } else if (field.integerValue !== undefined) {
        return field.integerValue;
    } else if (field.booleanValue !== undefined) {
        return field.booleanValue;
    } else if (field.timestampValue !== undefined) {
        return new Date(field.timestampValue);
    } else if (field.arrayValue !== undefined) {
        console.log('array field', field);
        console.log('array field values', field.arrayValue);
        return field.arrayValue.values?.map((z) => coreCoverterFromDoc(z)) ?? []
    } else if (field.mapValue !== undefined) {
        return convertFirestoreData(field.mapValue);
    } else {
        throw new Error(`Unsupported data type: ${typeof field}`);
    }
}

export function convertFirestoreData(data: { [s: string]: FirestoreField }) {
    const convertedData: DocumentFields = {};
    for (const key in data.fields) {
        convertedData[key] = coreCoverterFromDoc(data.fields[key]);
    }
    return convertedData;
}

// function convertFirestoreArray(array: { values?: FirestoreField[] }): any[] {
//     if (!array.values) return []
//     const javascriptIsTheWorstChoice = Object.fromEntries(Object.entries(array.values))
//     const out = convertFirestoreData({ fields: javascriptIsTheWorstChoice })
//     return Object.values(out)
// }


let accessToken: string
export async function makeAPIfetch(url: string, ctx: EventContext<Env, any, Record<string, unknown>>, extraHeaders?: RequestInit<CfProperties<unknown>>) {
    // console.log("making request to", url);

    let t0 = performance.now()

    if (!accessToken) {
        accessToken = await getAccessToken({
            credentials: ctx.env.GOOGLE_CLOUD_CREDENTIALS,
            scope: "https://www.googleapis.com/auth/datastore",
            waitUntil: ctx.waitUntil.bind(ctx),
        });
    }
    let t1 = performance.now()
    console.log("getting app access_token took", t1 - t0, "ms");

    const result: { fields?: DocumentFields, documents?: [DocumentFields], error?: any } = await fetch(
        url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        ...extraHeaders,
    }
    )
        .then(res => res.json())
        .catch((err) => {
            console.log("ERRORED OUT");
            console.error(err);
            console.log(err.details);
        });
    let t2 = performance.now()
    console.log("actual fetch took", t2 - t1, "ms");

    // console.log("result", result);
    if (result.error) {
        if (Array.isArray(result.error.details)) console.error("detailed error (array)", result.error.details[0]);
        if (result.error.details) console.error("error details", result.error.details);
        else console.error("error", result.error);
        return {}
    }
    let resultParsed: DocumentFields = {}
    if (result.documents) {
        result.documents.forEach(doc => {
            resultParsed[(doc.name as string).split('/').pop()] = convertFirestoreData(doc)
        })
    } else if (result.fields) {
        resultParsed = convertFirestoreData(result as { fields: DocumentFields })
    }
    let t3 = performance.now()
    console.log("parsing fetched data took", t3 - t2, "ms");

    // console.log("resultParsed", resultParsed);
    return resultParsed
}

function coreConverterToDoc(value: any): { [key: string]: any } {
    if (typeof value === 'string') {
        return { stringValue: value };
    } else if (typeof value === 'number') {
        return { integerValue: value };
    } else if (typeof value === 'boolean') {
        return { booleanValue: value };
    } else if (value instanceof Date) {
        return { timestampValue: value.toISOString() };
    } else if (Array.isArray(value)) {
        const out = value.map((z) => coreConverterToDoc(z));
        return { arrayValue: { values: out } };
    } else if (typeof value === 'object' && value !== null) {
        return { mapValue: { fields: createFirestoreDocument(value) } };
    } else {
        throw new Error(`Unsupported data type: ${typeof value}`);
    }
}
export function createFirestoreDocument(data: DocumentFields) {
    const fields: { [key: string]: FirestoreField } = {};

    for (const key in data) {
        const value = data[key];
        fields[key] = coreConverterToDoc(value);
    }
    return { fields };
}


export type DriveOptions = 'fields' // | 'access_token'

export async function drivePutMeta(fileMetadata: any, access_token: string, options?: Record<DriveOptions, any>, method: string = 'POST') {
    const encodedMetadata = JSON.stringify(fileMetadata);

    const urlparams = queryString.stringify(options)
    return fetch(`https://www.googleapis.com/drive/v3/files?${urlparams}`, {
        method: method,
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': `application/json`,
        },
        body: encodedMetadata,
    }).then(data => data.json())
}

export async function driveGet(fileId: string, access_token: string, method: string = 'GET', body?: BodyInit) {
    const params = method === "GET" ? "?alt=media" : ""
    return fetch(`https://www.googleapis.com/drive/v3/files/${fileId}${params}`, {
        method: method,
        headers: {
            'Authorization': `Bearer ${access_token}`,
        },
        body: body
    })
}

export async function drivePutMultipart(fileMetadata: any, fileBody: string, access_token: string, options: Record<DriveOptions, any>) {
    const encodedMetadata = JSON.stringify(fileMetadata);
    // Create multipart request body
    // const boundary = 'boundary';
    // const multipartBody = `\r\n--${boundary}\r\n` +
    //     'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    //     `${encodedMetadata}\r\n` +
    //     `--${boundary}\r\n` +
    //     'Content-Type: application/json\r\n\r\n' +
    //     `${fileBody}\r\n\r\n` +
    //     `--${boundary}--`;
    const boundary = 'boundary'
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";
    var multipartBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        encodedMetadata +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        fileBody + '\r\n' +
        close_delim;

    // console.log(multipartBody);


    const urlparams = queryString.stringify(options)
    return fetch(`https://www.googleapis.com/upload/drive/v3/files?${urlparams}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
            'Content-Length': multipartBody.length.toString(),
        },
        body: multipartBody,
    }).then(data => data.json())
}
