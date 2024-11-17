import {CodeMapping, forEachEmbeddedCode, LanguagePlugin, VirtualCode} from '@volar/language-core';
import type {TypeScriptExtraServiceScript} from '@volar/typescript';
import ts from 'typescript';
import {URI} from 'vscode-uri';
import * as console from "node:console";
import {LogUtil} from "./logutil.js";

export const ovsLanguagePlugin: LanguagePlugin<URI> = {
	getLanguageId(uri) {
		if (uri.path.endsWith('.ovs')) {
			return 'ovs';
		}
	},
	createVirtualCode(_uri, languageId, snapshot) {
		if (languageId === 'ovs') {
			return new OvsVirtualCode(snapshot);
		}
	},
	typescript: {
		extraFileExtensions: [{extension: 'ovs', isMixedContent: true, scriptKind: 7 satisfies ts.ScriptKind.Deferred}],
		getServiceScript() {
			return undefined;
		},
		getExtraServiceScripts(fileName, root) {
			const scripts: TypeScriptExtraServiceScript[] = [];
			//得到所有的虚拟代码片段
			const ary = [...forEachEmbeddedCode(root)]
			console.log(ary.length)
			LogUtil.log(ary.length)
			LogUtil.log(root.embeddedCodes)
			for (const code of ary) {
				LogUtil.log('code')
				LogUtil.log(code)
				LogUtil.log(code.languageId)
				if (code.languageId === 'qqqts') {
					scripts.push({
						fileName: fileName + '.' + code.id + '.ts',
						code,
						extension: '.ts',
						scriptKind: ts.ScriptKind.TS,
					});
				}
			}
			return scripts;
		},
	},
};

export class OvsVirtualCode implements VirtualCode {
	id = 'root';
	languageId = 'qqovs';
	mappings: CodeMapping[];
	embeddedCodes: VirtualCode[] = [];

	constructor(public snapshot: ts.IScriptSnapshot) {
		this.mappings = [{
			sourceOffsets: [0],
			generatedOffsets: [0],
			lengths: [snapshot.getLength()],
			data: {
				completion: true,
				format: true,
				navigation: true,
				semantic: true,
				structure: true,
				verification: true,
			},
		}];
		const styleText = snapshot.getText(0, snapshot.getLength());
		//将ovscode转为js代码，传给ts
		/*this.embeddedCodes = [{
            id: 'ts',
            languageId: 'qqqts',
            snapshot: {
                getText: (start, end) => styleText.substring(start, end),
                getLength: () => styleText.length,
                getChangeRange: () => undefined,
            },
            mappings: []
        }];*/

		this.embeddedCodes = [{
			id: 'ts1',
			languageId: 'qqqts',
			snapshot: {
				getText: (start, end) => styleText.substring(start, end),
				getLength: () => styleText.length,
				getChangeRange: () => undefined,
			},
			mappings: [{
				sourceOffsets: [0],
				generatedOffsets: [0],
				lengths: [styleText.length],
				data: {
					completion: true,
					format: true,
					navigation: true,
					semantic: true,
					structure: true,
					verification: true
				},
			}],
			embeddedCodes: [],
		}];
	}
}

