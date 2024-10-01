import { BaseProvider, OAuthTokens } from "../../types";
export declare namespace Discord {
    interface UserResponse {
        id: string;
        username: string;
        discriminator: string;
        avatar?: string;
        bot?: boolean;
        system?: boolean;
        mfa_enabled?: boolean;
        banner?: string;
        accent_color?: number;
        locale?: string;
        verified?: boolean;
        email?: string;
        flags?: number;
        premium_type?: number;
        public_flags?: number;
    }
    interface RedirectOptions extends BaseProvider.RedirectOptions {
        options: {
            prompt?: string;
            permissions?: string;
            guildId?: string;
            disableGuildSelect?: string;
        } & BaseProvider.RedirectOptions["options"];
    }
    interface CallbackResponse {
        user: UserResponse;
        tokens: OAuthTokens;
    }
}
