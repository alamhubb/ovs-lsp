import {VirtualCode} from "@volar/language-core";
import type {TextDocument} from "vscode-languageserver-textdocument";


export class VirtualOvsCode extends VirtualCode {
    constructor(snapshot: TextDocument) {
        super(snapshot);

// 将 .ovs 文件内容映射为 TypeScript 代码
        const content = snapshot.getText();
        this.embeddedCodes = [
            {
                id: 'ts',
                languageId: 'typescript',
                snapshot: {
                    getText: () => content,
                    getLength: () => content.length,
                    getLineCount: () => snapshot.lineCount,
                    offsetAt: pos => snapshot.offsetAt(pos),
                    positionAt: offset => snapshot.positionAt(offset),
                }
            }
        ];
    }
}
