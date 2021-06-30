import { defineConfig } from 'umi';

export default defineConfig({
    plugins: [
        require.resolve('../lib'),
        require.resolve('@umijs/plugin-initial-state'),
        require.resolve('@umijs/plugin-model'),
    ],
    oauth2Client: {
        clientId: '92bc9822-95f4-40f8-b2cf-69fbfa3afa12',
        accessTokenUri: 'https://account.apigg.com/oauth/token',
        authorizationUri: 'https://account.apigg.com/oauth/authorize',
        redirectUri: 'http://dev.apigg.net:8000/oauth2/callback',
        userInfoUri: 'https://account.apigg.com/api/user',
        homePagePath: '/',
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
});