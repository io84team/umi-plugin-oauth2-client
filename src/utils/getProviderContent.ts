export default (config: OAuth2Client.Config) => {
    return `\
import React, { useState, useEffect } from 'react';
import { useLocalStorageState, useSessionStorageState } from 'ahooks';
import ClientOAuth2, { Token } from 'client-oauth2';
import type { IRouteComponentProps } from 'umi';
import { ApplyPluginsType } from 'umi';
import { create } from 'pkce';
import { OAuth2Client, OAuth2UserContext } from '../core/umiExports';
import { plugin } from '../core/umiExports';
import { History } from 'history-with-query';

const clientId = '${config.clientId}';
const accessTokenUri = '${config.accessTokenUri}';
const authorizationUri = '${config.authorizationUri}';
const redirectUri = '${config.redirectUri}';
const scopes = ${JSON.stringify(config.scopes)};
const userInfoUri = '${config.userInfoUri}';
const homePagePath = '${config.homePagePath || '/'}';
const codeChallengeMethod = '${config.codeChallengeMethod || 'S256'}';
const userSignOutUri = '${config.userSignOutUri || ''}';

const tokenKey = 'UMI_OAUTH2_CLIENT_TOKEN_KEY';
const codePairKey = 'UMI_OAUTH2_CLIENT_CODE_PAIR_KEY';
const uriTargetKey = 'UMI_OAUTH2_CLIENT_URI_TARGET_KEY';

const OAuth2 = new ClientOAuth2({
    clientId,
    accessTokenUri,
    authorizationUri,
    redirectUri,
}, (method, url, body, headers) => fetch(url, {body: method.toUpperCase() === 'GET' ? undefined : body, method, headers, credentials: "include"}).then(res => res.text().then(body => ({status: res.status, body}))));

interface Props {
    children: React.ReactNode;
}

const isRedirectPath = (path: string): boolean => {
    console.log('check if ', path , ' is redirect path...');
    return path.length > 1 && redirectUri.indexOf(path) !== -1;
};

const isEmptyObject = obj => (Object.keys(obj).length === 0 && obj.constructor === Object) || !obj.access_token;

const useUserInfo = (
    token: OAuth2Client.TokenData,
    setToken: (token: OAuth2Client.TokenData) => void,
) => {
    const [userInfo, setUserInfo] = useState<UserInfo>(undefined);

    useEffect(() => {
        console.log('token = ', token, ', userInfo = ', userInfo);
        if (token !== undefined && !isEmptyObject(token) && userInfo === undefined) {
            console.log('constructing tokenObj...');
            console.log('OAuth2 = ', OAuth2);
            console.log('token = ', token);
            const tokenObject = new Token(OAuth2, token)
            console.log('tokenObject = ', tokenObject);

            const requestObject = tokenObject.sign({
                method: 'get',
                url: userInfoUri,
            });

            console.log('requesting ', requestObject.url, requestObject.method, requestObject.headers);
            OAuth2.request(requestObject.method, requestObject.url, {}, requestObject.headers)
                .then(res => {
                    console.log('res = ', res);
                    if(res.status === 401) {
                        throw new Error(401);
                    }

                    if(res.status === 500) {
                        throw new Error(500);
                    }

                    if (res.body && JSON.parse(res.body)) {
                        const user = JSON.parse(res.body);
                        setUserInfo(user);
                    }
                })
                .catch((err) => {
                    console.error('token error, clearing...', err);
                    setToken(undefined);
                    console.log('token cleared');
                });
        }
    }, [token, userInfo]);

    return { userInfo, setUserInfo };
};

const useToken = (
    history: History,
    codePair: OAuth2Client.CodePair
): {
    token: OAuth2Client.TokenData;
    setToken: (token: OAuth2Client.TokenData) => void;
} => {
    const [token, setToken] = useLocalStorageState<OAuth2Client.TokenData>(
        tokenKey,
        undefined,
    );

    const uri: string = history.createHref(history.location);

    useEffect(() => {
        console.log('usetoken isRedirectPath(history.location.pathname) = ', isRedirectPath(history.location.pathname));
        if (isRedirectPath(history.location.pathname)) {
            if (history.location.query?.error) {
                setToken(undefined);
                return;
            }

            if ((token === undefined || isEmptyObject(token)) || (token !== undefined && (new Token(OAuth2, token)).expired())) {
                console.log('codePair = ', codePair);

                OAuth2.code.getToken(uri, {
                    body: {
                        code_verifier: codePair?.codeVerifier,
                    }
                }).then(tk => {
                    console.log('token res = ', tk);
                    if (tk.data) {
                        setToken({
                            access_token: tk.data.access_token,
                            refresh_token: tk.data.refresh_token,
                            token_type: tk.data.token_type,
                            expires_in: tk.data.expires_in,
                            id_token: tk.data.id_token,
                        })
                    }
                })
                .catch(() => {
                        setToken(undefined);
                        history.push(homePagePath);
                        window.location.reload();
                        return;
                });
            }
        }
    }, [token]);

    return { token, setToken };
};

const Provider: React.FC<Props & IRouteComponentProps> = props => {
    const { children, history } = props;
    const useRuntimeConfig =
        plugin.applyPlugins({
            key: "initialStateConfig",
            type: ApplyPluginsType.modify,
            initialValue: {},
        }) || {};

    const [codePair, setCodePair] = useSessionStorageState<OAuth2Client.CodePair>(
        codePairKey,
        create()
    );

    const [targetUri, setTargetUri] = useSessionStorageState<string>(uriTargetKey, homePagePath);

    const { token, setToken } = useToken(history, codePair);

    const { userInfo, setUserInfo } = useUserInfo(token, setToken);

    const getSignUri: string = () => {
        let newCodePair = codePair || create();

        const { codeChallenge } = newCodePair;

        const ssoUri = OAuth2.code.getUri({
            state: codeChallenge,
            query: {
                code_challenge: codeChallenge,
                code_challenge_method: codeChallengeMethod,
            },
            scopes
        });

        setCodePair(newCodePair);
        setTargetUri(history.location.pathname);

        return ssoUri;
    }

    const refresh = (token) => {
        const tokenObject = OAuth2.createToken(token.access_token, token.refresh_token);
        tokenObject.refresh().then(res => {
            console.log('refresh res = ', res);
            setToken(res.data);
        });
    }

    const signIn = () => {
        window.location.href = getSignUri();
    }

    const ssoSignOut = () => {
        if (token) {
            const tokenObject = new Token(OAuth2, token);
            const requestObject = tokenObject.sign({
                method: 'post',
                url: userSignOutUri,
            });

            OAuth2.request(
                requestObject.method,
                requestObject.url,
                {},
                requestObject.headers,
            ).then(console.info);
        }
    };

    const signOut = () => {
        setToken(undefined);
        setUserInfo(undefined);

        if (userSignOutUri.indexOf('http') !== -1) {
            ssoSignOut();
        }

        history.push(homePagePath);
    };

    useEffect(() => {
        if (isRedirectPath(history.location.pathname)) {
            if (token !== undefined) {
                setCodePair(undefined);
                if (userInfo !== undefined) {
                    setTargetUri(undefined);
                    history.push(targetUri);
                }
            }
        };
    }, [token, userInfo]);

    if (isRedirectPath(history.location.pathname)) {
        if (history.location.query?.error) {
            return React.createElement(useRuntimeConfig.error, {
                error: history.location.query?.error,
            });
        }
        return useRuntimeConfig.loading;
    }

    return React.createElement(
        OAuth2UserContext.Provider,
        {
            value: {
                token: token,
                user: userInfo,
                getSignUri: getSignUri,
                signIn: signIn,
                signOut: signOut,
                refresh: refresh,
            }
        },
        React.cloneElement(children, {
            ...children.props,
            routes: props.routes,
        }),
    );
};

export default Provider;
`;
};
