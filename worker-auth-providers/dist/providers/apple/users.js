import { importPKCS8, SignJWT, decodeJwt } from "jose";
import { ConfigError, ProviderGetUserError, TokenError, } from "../../utils/errors";
import { parseQuerystring } from "../../utils/helpers";
import { logger } from "../../utils/logger";
function replaceEscapeCharacters(input) {
    return input.replace(/\\n/g, "\n");
}
export async function convertPrivateKeyToClientSecret({ privateKey, keyIdentifier, teamId, clientId, expAfter, }) {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + expAfter;
    privateKey = replaceEscapeCharacters(privateKey);
    const payload = {
        iss: teamId,
        iat: now,
        exp: now + expAfter,
        aud: "https://appleid.apple.com",
        sub: clientId,
    };
    const key = await importPKCS8(privateKey, "ES256");
    console.log(key);
    const clientSecret = await new SignJWT(payload)
        .setProtectedHeader({ alg: "ES256", kid: keyIdentifier, typ: "JWT" })
        .setIssuedAt(now)
        .setExpirationTime(exp)
        .sign(key);
    return clientSecret;
}
export async function getTokensFromCode(code, { clientId, clientSecret, redirectUrl }) {
    const params = {
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUrl,
    };
    const response = await fetch("https://appleid.apple.com/auth/token", {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(params).toString(),
    });
    const result = await response.json();
    logger.log(`[tokens], ${JSON.stringify(result)}`, "info");
    if (result.error) {
        throw new TokenError({
            message: result.error_description,
        });
    }
    return result;
}
export async function getUser(token) {
    try {
        const data = decodeJwt(token);
        logger.log(`[provider user data], ${JSON.stringify(data)}`, "info");
        return data;
    }
    catch (e) {
        logger.log(`[error], ${JSON.stringify(e.stack)}`, "error");
        throw new ProviderGetUserError({
            message: "There was an error fetching the user",
        });
    }
}
export default async function callback({ options, request, }) {
    const { query } = parseQuerystring(request);
    logger.setEnabled(options?.isLogEnabled || false);
    logger.log(`[code], ${JSON.stringify(query.code)}`, "info");
    if (!query.code) {
        throw new ConfigError({
            message: "No code is passed!",
        });
    }
    const tokens = await getTokensFromCode(query.code, options);
    const accessToken = tokens.access_token;
    logger.log(`[access_token], ${JSON.stringify(accessToken)}`, "info");
    const providerUser = await getUser(accessToken);
    return {
        user: providerUser,
        tokens,
    };
}
