// src/server.ts
import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    TextDocumentSyncKind,
    InitializeParams,
    InitializeResult,
    SemanticTokensRequest,
    SemanticTokensBuilder,
    SemanticTokensLegend, CompletionItem, CompletionItemKind
} from 'vscode-languageserver/node'

import {fileURLToPath} from 'url'
import {TextDocument} from 'vscode-languageserver-textdocument'
import * as fs from 'fs'
import * as path from 'path'
import {
    CompletionParams,
    Hover,
    HoverParams,
    SemanticTokenModifiers,
    SemanticTokenTypes,
    TextDocumentIdentifier
} from 'vscode-languageserver'
import SubhutiLexer from 'subhuti/src/parser/SubhutiLexer.ts'
import {es6Tokens, es6TokensObj} from 'subhuti/src/syntax/es6/Es6Tokens.ts'
import JsonUtil from 'subhuti/src/utils/JsonUtil.ts'
import {OvsToAstUtil} from "./ovs/factory/OvsToAstUtil.ts";
import {TokenProvider, tokenTypesObj} from "./IntellijTokenUtil.ts";
import OvsParser from "./ovs/parser/OvsParser.ts";
import {LogUtil} from "./logutil.ts";
import {FileUtil} from "./utils/FileUtils.ts";

// 创建连接
const connection = createConnection(ProposedFeatures.all)

// 创建文档管理器
const documents = new TextDocuments(TextDocument)


// 定义日志文件路径

// 定义语义标记类型和修饰符
// const tokenTypes = tokenTypesObj.
const tokenTypes = Object.values(tokenTypesObj).map(item => item.toUpperCase())
const tokenModifiers: string[] = []

// 创建语义标记图例
const legend: SemanticTokensLegend = {
    tokenTypes: tokenTypes,
    tokenModifiers: tokenModifiers
}


// 修改初始化处理
connection.onInitialize((params: InitializeParams): InitializeResult => {
    LogUtil.log('Server initializing with capabilities', {
        capabilities: params.capabilities
    });

    // 确保工作区文件夹存在
    if (params.workspaceFolders && params.workspaceFolders.length > 0) {
        const files = FileUtil.getAllFiles(params.workspaceFolders[0].uri);
        LogUtil.log('Workspace files:', files);
    }

    return {
        capabilities: {
            textDocumentSync: {
                openClose: true,
                change: TextDocumentSyncKind.Incremental,
                willSave: false,
                willSaveWaitUntil: false,
                save: {
                    includeText: false
                }
            },
            semanticTokensProvider: {
                legend,
                full: true,
                range: true
            },
            hoverProvider: true,
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ['.']
            }
        }
    }
})


// 启动服务器
documents.listen(connection)
connection.listen()
