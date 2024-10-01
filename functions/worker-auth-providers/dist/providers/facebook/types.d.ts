import { BaseProvider, OAuthTokens } from "../../types";
export declare namespace Facebook {
    interface UserResponse {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
    }
    interface CallbackOptions {
        request: Request;
        options: {
            fields?: string;
        } & BaseProvider.TokensFromCodeOptions;
    }
    interface CallbackResponse {
        user: UserResponse;
        tokens: OAuthTokens;
    }
    interface RedirectOptions {
        options: {
            clientId: string;
            /**
             * @deprecated Use `redirectTo` instead.
             */
            redirectUrl?: string;
            /**
             * Use this option instead of `redirectUrl`, which is deprecated.
             */
            redirectTo?: string;
            scope?: string[];
            responseType?: string;
            authType?: string;
            display?: string;
        };
    }
}
