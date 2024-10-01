import { BaseProvider, OAuthTokens } from '../../types';
import { Gitlab } from "./types";
export declare function getTokensFromCode(code: string, { clientId, clientSecret, redirectUrl }: BaseProvider.TokensFromCodeOptions): Promise<OAuthTokens>;
export declare function getUser(token: string): Promise<Gitlab.UserResponse>;
export default function callback({ options, request }: BaseProvider.CallbackOptions): Promise<Gitlab.CallbackResponse>;
