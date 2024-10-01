import { OAuthTokens } from "../../types";
export declare namespace Google {
    interface UserResponse {
        id: string;
        email: string;
        verified_email: boolean;
        name: string;
        given_name: string;
        family_name: string;
        picture: string;
        locale: string;
    }
    interface CallbackResponse {
        user: UserResponse;
        tokens: OAuthTokens;
    }
}
