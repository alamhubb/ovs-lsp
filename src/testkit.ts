import kit from '@volar/kit';
import {ovsLanguagePlugin} from "./languagePlugin";
import {createTypeScriptServices} from "./typescript";
import * as fs from "node:fs";
import * as path from "node:path";
import {loadTsdkByPath} from "@volar/language-server/node";

console.log(kit)

const languagePlugins = [
    ovsLanguagePlugin
];

function getLocalTsdkPath() {
    let tsdkPath = "C:\\Users\\qinkaiyuan\\AppData\\Roaming\\npm\\node_modules\\typescript\\lib";
    return tsdkPath.replace(/\\/g, '/');
}

const tsdkPath = getLocalTsdkPath();

const tsdk = loadTsdkByPath(tsdkPath, 'en');

const services = [...createTypeScriptServices(tsdk.typescript)];

function getTsconfig() {

    let tsconfig = path.resolve(process.cwd(), './tsconfig.json');

    const tsconfigIndex = process.argv.indexOf('--tsconfig');
    if (tsconfigIndex >= 0) {
        tsconfig = path.resolve(process.cwd(), process.argv[tsconfigIndex + 1]);
    }

    if (!fs.existsSync(tsconfig)) {
        throw `tsconfig.json not found: ${tsconfig}`;
    }

    return tsconfig;
}

const tsconfigPath = getTsconfig()
let includeProjectReference = false
const linter = kit.createTypeScriptChecker(languagePlugins, services, tsconfigPath, includeProjectReference)
