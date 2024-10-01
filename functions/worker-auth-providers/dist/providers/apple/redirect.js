import * as queryString from "query-string";
import { ConfigError } from "../../utils/errors";
export default async function redirect({ options, }) {
    const { clientId, redirectTo, scope = [], state, responseMode = "query", responseType = "code" } = options;
    if (!clientId) {
        throw new ConfigError({
            message: "No client id passed",
        });
    }
    const params = {
        client_id: clientId,
        redirect_uri: redirectTo,
        response_type: responseType,
        scope: scope.join(" "),
        state: state || Math.random().toString(36).substring(7),
        response_mode: responseMode,
    };
    const paramString = queryString.stringify(params);
    const appleLoginUrl = `https://appleid.apple.com/auth/authorize?${paramString}`;
    return appleLoginUrl;
}
