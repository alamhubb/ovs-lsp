import {
    createConnection,
    createServer,
    createTypeScriptProject,
    loadTsdkByPath
} from '@volar/language-server/node';
import {create as createTypeScriptServicePlugin} from 'volar-service-typescript';
import {createOvsLanguagePlugin} from "./OvsLanguagePlugin.ts";

const connection = createConnection();
const server = createServer(connection);

function getLocalTsdkPath() {
    let tsdkPath = "C:\\Users\\qinkaiyuan\\AppData\\Roaming\\npm\\node_modules\\typescript\\lib";
    return tsdkPath.replace(/\\/g, '/');
}

connection.onInitialize(params => {
    const tsPath = getLocalTsdkPath()
    const tsdk = loadTsdkByPath(tsPath, params.locale);

    return server.initialize(
        params,
        createTypeScriptProject(tsdk.typescript, tsdk.diagnosticMessages, () => ({
            languagePlugins: [createOvsLanguagePlugin],
        })),
        [
            ...createTypeScriptServicePlugin(tsdk.typescript)
        ]
    );
});

connection.onInitialized(() => {
    server.initialized();
    server.fileWatcher.watchFiles(['**/*.ovs']);
});

connection.listen();
