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


// 将 import.meta.url 转换为本地文件路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 定义日志文件路径
const logFilePath = path.join(__dirname, 'temp2222.txt')

console.log(logFilePath) // 输出日志文件的绝对路径

// 初始化日志文件
fs.writeFileSync(logFilePath, '=== LSP Server Started ===\n')

// 定义语义标记类型和修饰符
// const tokenTypes = tokenTypesObj.
const tokenTypes = Object.values(tokenTypesObj).map(item => item.toUpperCase())
const tokenModifiers: string[] = []

// 创建语义标记图例
const legend: SemanticTokensLegend = {
    tokenTypes: tokenTypes,
    tokenModifiers: tokenModifiers
}

connection.languages.semanticTokens.on(params => {
    const document = documents.get(params.textDocument.uri)

    const content = document.getText();

    // 1. 验证内容
    if (!content || content.trim().length === 0) {
        return;
    }


    const builder = new SemanticTokensBuilder()
    const text = document.getText()

    const lexer = new SubhutiLexer(es6Tokens)
    let tokens = lexer.lexer(text)
    const parser = new OvsParser(tokens)
    let curCst = parser.Program()
    const ast = OvsToAstUtil.createProgramAst(curCst)
    TokenProvider.visitNode(ast)
    JsonUtil.log(TokenProvider.tokens)
    const tokens1 = TokenProvider.tokens
    LogUtil.log('Sending tokensRecord', JsonUtil.toJson(tokens))

    for (const token of tokens1) {
        builder.push(
            token.line,
            token.char,
            token.length,
            token.tokenType,
            token.tokenModifiers,
        )

    }
    const build =  builder.build()
    LogUtil.log(build)
    return build
})

// 处理语义标记请求
/*connection.onRequest(
    'textDocument/semanticTokens/full',
);*/

// 初始化处理
connection.onInitialize((params: InitializeParams): InitializeResult => {
    LogUtil.log('Server initializing with capabilities', {
        capabilities: params.capabilities
    })

    LogUtil.log(params)
    const files = FileUtil.getAllFiles(params.workspaceFolders[0].uri)
    LogUtil.log(files)
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
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

connection.onHover((params: HoverParams): Promise<Hover> => {
    LogUtil.log('Document onHover', {
        uri: params.textDocument.uri
    })
    return Promise.resolve({
        contents: ["Hover Demo qqqq"],
    })
})

// 监听文档变化
documents.onDidChangeContent(change => {
    LogUtil.log('Document changed', {
        uri: change.document.uri,
        version: change.document.version
    })
})

// 监听文档打开
documents.onDidOpen(event => {
    LogUtil.log('Document opened', {
        uri: event.document.uri,
        languageId: event.document.languageId
    })
})

// 启动服务器
documents.listen(connection)
connection.listen()

// 记录未捕获的错误
process.on('uncaughtException', (error) => {
    LogUtil.log('Uncaught Exception', {
        error: error.message,
        stack: error.stack
    })
})

process.on('unhandledRejection', (reason, promise) => {
    LogUtil.log('Unhandled Rejection', {
        reason: reason,
        promise: promise
    })
})
