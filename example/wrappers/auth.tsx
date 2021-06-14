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
