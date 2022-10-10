# umi-plugin-oauth2

---

> 适配基于 UmiJs 前端（如 antd pro）的 OAuth 2.0 客户端插件。
>
> OAuth 2.0 Client for UmiJs based (antd pro, etc) front-end apps.

[![NPM version](https://img.shields.io/npm/v/@jeff-tian/umi-plugin-oauth2.svg?style=flat)](https://npmjs. org/package/@jeff-tian/umi-plugin-oauth2) [![NPM downloads](http://img.shields. io/npm/dm/@jeff-tian/umi-plugin-oauth2.svg?style=flat)](https://npmjs. org/package/@jeff-tian/umi-plugin-oauth2)

## Why 为什么有这个库

这是一个 fork 库，并做了一些修改。在原库的基础上添加了 refresh token 功能，以及给 client-oauth2 传入了一个自定义的 request 库（带 credentials 的 fetch）。

从而解决了登录态较短的问题，以及在发请求时带上 Cookie 从而避免授权服务器有多个实例时的 Session 漂移的问题（对应 https://zhuanlan.zhihu.com/p/571926698 提到的 Session Sticky 方案，如果授权服务器有多个实例并且启用了依赖 cookie 的 Session Sticky，那么 fetch 请求需要带上 cookie 才行，底层依赖的 client-oauth2 默认的 fetch 是不带的）。

## Warning 警告 ⚠️

该插件让基于 UmiJs 开发的纯前端项目（包括 antd pro）可以直接对接授权服务，功能上没有任何问题。然而，如果考虑极致的安全性，这种前端直接对接授权服务器的做法并不好，推荐使用完整 BFF 模式，即所有和授权服务的交流都在 BFF 层完成，前端无感知。详情参考专栏 https://zhuanlan.zhihu.com/p/571585321。

## Install

```bash
# or yarn
$ npm install
```

```bash
$ npm run build --watch
$ npm run start
```

## Usage 使用说明

### 可以参考相关专栏

-   https://zhuanlan.zhihu.com/p/533197284

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

## 提示

关于 umi 项目的多环境配置，这里做一些友情提示。由于 umi js 的多环境配置有一些特别，并且文档没有详细描述，导致在实际使用中可能会踩坑（详见： https://github.com/umijs/umi/discussions/8341）。

首先，真实的项目中很可能有这样的配置文件：

```
- .umirc.[tj]s 基础配置
- .umirc.dev.[tj]s 开发环境专用配置
- .umirc.stg.[tj]s 测试环境专用配置
- .umirc.uat.[tj]s 验收环境专用配置
- .umirc.prod.[tj]s 生产环境专用配置
```

其中开发环境是指所有的开发共用的线上环境，除些之外，很可能开发自己还需要一个本地专用配置，这个本地专用配置，可以将授权服务配置为本地启用的服务（localhost），所以又建立了一个

```
- .umirc.local.[tj]s 本地专用配置
```

理想情况下，所有环境都有一个 `UMI_ENV` 环境变量，这样，一切都很完美，各个环境各取所需，要连本地环境只需要 `UMI_ENV=local yarn start` 就可以了。

但是，UmiJs 的实现，将 `umirc.local.[tj]s` 文件做为最高优先级处理，导致本地有了这个配置后，不需要指定 `UMI_ENV=local`，项目启动时就能读取到本地配置。这带了一些问题：即，虽然在本地开发，但有时候希望本地模拟其他环境时，不能简单地使用 `UMI_ENV=dev yarn start` 实现本地启动的 UmiJs 项目调用开发环境的服务。

也就是说，即使通过 `UMI_ENV=dev yarn start` 启动了项目，仍然会调用本地的服务。当然可以通过删除 `umirc.local.[tj]s` 文件，或者删除 `umirc.local.[tj]s` 文件中对应的服务器配置，但是要切换加本地服务时又要修改回去，就很麻烦。

**基于这种情况，建议不要使用 `umirc.local.[tj]s` 文件，而是命名为 `umirc.work.[tj]s` 之类的文件。这样，就可以自由地使用 `UMI_ENV=work yarn start` 的方式来切换配置了。**

个人觉得多环境配置的多层优先级（以及多层继承关系）设计，是一种过度设计。其实简单一点，根据环境变量去决定，更简单，没有歧义。

## LICENSE

MIT
