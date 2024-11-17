import {
    createConnection,
    createServer,
    createTypeScriptProject,
    loadTsdkByPath
} from '@volar/language-server/node';
import {ovsLanguagePlugin} from './languagePlugin';
import {LogUtil} from "./logutil";
import {create as createTypeScriptServices} from "volar-service-typescript";
const connection = createConnection();


const server = createServer(connection);

connection.listen();

function getLocalTsdkPath() {
    let tsdkPath = "C:\\Users\\qinkaiyuan\\AppData\\Roaming\\npm\\node_modules\\typescript\\lib";
    return tsdkPath.replace(/\\/g, '/');
}
const tsdkPath = getLocalTsdkPath();

connection.onInitialize(params => {
    LogUtil.log('params')
    LogUtil.log(params)
    const tsdk = loadTsdkByPath(tsdkPath, params.locale);
    const tsProject = createTypeScriptProject(
        tsdk.typescript,
        tsdk.diagnosticMessages,
        () => ({
            languagePlugins: [ovsLanguagePlugin],
        }))
    return server.initialize(
        params,
        tsProject,
        [
            ...createTypeScriptServices(tsdk.typescript)
        ],
    )
});

connection.onInitialized(server.initialized);

connection.onShutdown(server.shutdown);
