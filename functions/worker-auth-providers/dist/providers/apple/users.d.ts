import { BaseProvider, OAuthTokens } from "../../types";
import { Apple } from "./types";
export declare function convertPrivateKeyToClientSecret({ privateKey, keyIdentifier, teamId, clientId, expAfter, }: Apple.ConvertPrivateKeyToClientSecretOptions): Promise<string>;
export declare function getTokensFromCode(code: string, { clientId, clientSecret, redirectUrl }: BaseProvider.TokensFromCodeOptions): Promise<OAuthTokens>;
export declare function getUser(token: string): Promise<Apple.UserResponse>;
export default function callback({ options, request, }: BaseProvider.CallbackOptions): Promise<Apple.CallbackResponse>;
