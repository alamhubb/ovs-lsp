import type {LanguagePlugin} from '@volar/language-service';
import {URI} from 'vscode-uri';
import {CodeMapping, VirtualCode} from "@volar/language-core";
import ts from "typescript";

export class OvsVirtualCode implements VirtualCode {
    id = 'root';
    languageId = 'ovs';
    mappings: CodeMapping[];
    embeddedCodes: VirtualCode[] = [];

    constructor(public snapshot: ts.IScriptSnapshot) {
// 将 .ovs 文件内容映射为 TypeScript 代码
        this.embeddedCodes = [
            {
                id: 'ts',
                languageId: 'typescript',
                snapshot: snapshot,
                mappings: []
            }
        ];
    }
}
export const createOvsLanguagePlugin: LanguagePlugin<URI> = {
// 识别 .ovs 文件
    getLanguageId(uri: URI) {
        if (uri.toString().endsWith('.ovs')) {
            return 'ovs';
        }
    },
    createVirtualCode(_uri, languageId, snapshot) {
        if (languageId === 'ovs') {
            return new OvsVirtualCode(snapshot);
        }
    },

    // TypeScript 配置
    typescript: {
        extraFileExtensions: [
            {
                extension: 'ovs',
                isMixedContent: false,
                scriptKind: ts.ScriptKind.TS
            }
        ],
        // 获取服务脚本
        getServiceScript(root) {
            if (root.embeddedCodes) {
                return {
                    code: root.embeddedCodes[0],
                    extension: '.ts',
                    scriptKind: ts.ScriptKind.TS
                };
            }
        }
    }
};
