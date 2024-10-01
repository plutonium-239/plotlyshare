import { ConfigError, ProviderGetUserError, TokenError } from '../../utils/errors';
import { parseQuerystring } from '../../utils/helpers';
import { logger } from '../../utils/logger';
export async function getTokensFromCode(code, { clientId, clientSecret, redirectUrl }) {
    const params = {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUrl,
    };
    const response = await fetch('https://gitlab.com/oauth/token', {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params).toString(),
    });
    const result = await response.json();
    logger.log(`[tokens], ${JSON.stringify(result)}`, 'info');
    if (result.error) {
        throw new TokenError({
            message: result.error_description,
        });
    }
    return result;
}
export async function getUser(token) {
    try {
        const headers = {
            Authorization: `Bearer ${token}`,
        };
        const getUserResponse = await fetch('https://gitlab.com/api/v4/user', {
            method: 'GET',
            headers,
        });
        const data = await getUserResponse.json();
        logger.log(`[provider user data], ${JSON.stringify(data)}`, 'info');
        return data;
    }
    catch (e) {
        logger.log(`[error], ${JSON.stringify(e.stack)}`, 'error');
        throw new ProviderGetUserError({
            message: 'There was an error fetching the user',
        });
    }
}
export default async function callback({ options, request }) {
    const { query } = parseQuerystring(request);
    logger.setEnabled(options?.isLogEnabled || false);
    logger.log(`[code], ${JSON.stringify(query.code)}`, 'info');
    if (!query.code) {
        throw new ConfigError({
            message: 'No code is passed!',
        });
    }
    const tokens = await getTokensFromCode(query.code, options);
    const accessToken = tokens.access_token;
    logger.log(`[access_token], ${JSON.stringify(accessToken)}`, 'info');
    const providerUser = await getUser(accessToken);
    return {
        user: providerUser,
        tokens,
    };
}
