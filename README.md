# umi-plugin-oauth2-client

[![NPM version](https://img.shields.io/npm/v/@io84team/umi-plugin-oauth2-client.svg?style=flat)](https://npmjs.org/package/@io84team/umi-plugin-oauth2-client) [![NPM downloads](http://img.shields.io/npm/dm/@io84team/umi-plugin-oauth2-client.svg?style=flat)](https://npmjs.org/package/@io84team/umi-plugin-oauth2-client)

OAuth2 Client

## Install

```bash
# or yarn
$ npm install
```

```bash
$ npm run build --watch
$ npm run start
```

## Usage

1. Configure in `.umirc.js`,

```js
export default {
    plugins: [['umi-plugin-oauth2-client']],
    oauth2Client: {
        clientId: '92bc9822-95f4-40f8-b2cf-69fbfa3afa12',
        accessTokenUri: 'https://account.apigg.com/oauth/token',
        authorizationUri: 'https://account.apigg.com/oauth/authorize',
        redirectUri: 'http://dev.apigg.net:8000/oauth2/callback',
        scopes: ['openid', 'email', 'profile'],
        userInfoUri: 'https://account.apigg.com/api/user',
        userSignOutUri: 'https://account.apigg.com/api/signout',
        homePagePath: '/',
        codeChallengeMethod: 'S256',
    },
    routes: [
        {
            exact: true,
            title: 'Home',
            path: '/',
            component: 'index',
        },
        {
            exact: true,
            title: 'User',
            path: '/user',
            wrappers: ['@/wrappers/auth.tsx'],
            component: 'user',
        },
    ],
};
```

2. Configure in `app.tsx`,
```tsx
export const initialStateConfig = {
    loading: 'Loading...',
    error: (props: { error: string }) => {
        return <p>Error: {props.error}</p>;
    },
};
```

3. Create a file `@/wrappers/auth.tsx`,

```tsx
import React from 'react';
import { useEffect } from 'react';
import type { IRouteComponentProps } from 'umi';
import { useOAuth2User } from 'umi';

const Auth: React.FC<IRouteComponentProps> = (props) => {
    const { children } = props;

    // const { token, user, signIn, getSignUri } = useOAuth2User();
    const { token, user, signIn } = useOAuth2User();

    useEffect(
        () => {
            if (token === undefined && user === undefined) {
                // token 和 user 都是 undefined 时才需要请求。

                // const uri = getSignUri();
                // return <a href={uri}>Goto SSO</a>;
                // 显示登录链接，或者自动跳转登录，或者跳转到自己的登录页面。
                signIn();
            }
        },
        // 注销时不会重复登录
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    if (token !== undefined && user !== undefined) {
        return children;
    }
    return <span>Loading...</span>;
};

export default Auth;
```

4. Using user object in your page file.

```tsx
import React from 'react';
import styles from './index.css';
import { Link, OAuth2UserContext } from 'umi';

const Home: React.FC = () => {
    return (
        <OAuth2UserContext.Consumer>
            {({ user }) => (
                <div className={styles.normal}>
                    <div>{user ? user.name : ''}</div>
                    <Link to="/user">User</Link>
                </div>
            )}
        </OAuth2UserContext.Consumer>
    );
};

export default Home;
```


## Options

TODO

## LICENSE

MIT
