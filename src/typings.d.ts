// @ts-ignore
/* eslint-disable */

declare namespace OAuth2Client {
    type Config = {
        clientId: string;
        accessTokenUri: string;
        authorizationUri: string;
        redirectUri: string;
        scopes: string[];
        userInfoUri: string;
        homePagePath?: string;
        codeChallengeMethod?: string;
        userSignOutUri?: string;
    };

    type CodePair = {
        codeChallenge: string;
        codeVerifier: string;
    };

    type UserInfo = {
        id: string;
        name: string;
        email: string;
    };

    type TokenData = {
        access_token: string;
        refresh_token: string;
        token_type: string;
        expires_in: string;
    };

    type OAuth2UserContextType = {
        token: TokenData;
        user: UserInfo;
        getSignUri: () => {};
        signIn: () => {};
        signOut: () => {};
    };
}
