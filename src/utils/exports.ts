export default () => {
    return `\
import React, { useContext } from 'react';

export declare namespace OAuth2Client {
    type Config = {
        clientId: string;
        accessTokenUri: string;
        authorizationUri: string;
        redirectUri: string;
        userInfoUri: string;
        homePagePath?: string;
        codeChallengeMethod?: string;
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

export const OAuth2UserContext = React.createContext<
    OAuth2Client.OAuth2UserContextType
>(undefined);

export const useOAuth2User = () => {
    const user = useContext<OAuth2Client.OAuth2UserContextType>(
        OAuth2UserContext,
    );
    return user;
};
`;
};
