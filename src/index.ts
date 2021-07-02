// ref:
// - https://umijs.org/plugins/api
import type { IApi } from '@umijs/types';
import getRootContainerContent from './utils/getRootContainerContent';
import getProviderContent from './utils/getProviderContent';
import getExports from './utils/exports';
import { join } from 'path';

const PLUGIN_DIR = 'plugin-oauth2-client';

export default (api: IApi) => {
    const umiTmpDir = api.paths.absTmpPath;

    api.describe({
        key: 'oauth2Client',
        config: {
            schema(joi) {
                return joi.object();
            },
            onChange: api.ConfigChangeType.regenerateTmpFiles,
        },
        enableBy: api.EnableBy.config,
    });

    api.onGenerateFiles(() => {
        api.writeTmpFile({
            path: `${PLUGIN_DIR}/rootContainer.ts`,
            content: getRootContainerContent(),
        });

        api.writeTmpFile({
            path: `${PLUGIN_DIR}/Provider.ts`,
            content: getProviderContent(api.userConfig.oauth2Client),
        });

        api.writeTmpFile({
            path: `${PLUGIN_DIR}/exports.ts`,
            content: getExports(),
        });
    });

    api.addRuntimePlugin({
        fn: () => [join(umiTmpDir!, `${PLUGIN_DIR}/rootContainer.ts`)],
    });

    api.addUmiExports(() => [
        {
            exportAll: true,
            source: `../${PLUGIN_DIR}/exports`,
        },
    ]);

    api.addTmpGenerateWatcherPaths(() => [
        join(umiTmpDir!, `${PLUGIN_DIR}/rootContainer.ts`),
        join(umiTmpDir!, `${PLUGIN_DIR}/Provider.ts`),
        join(umiTmpDir!, `${PLUGIN_DIR}/exports.ts`),
    ]);
};
