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
    SemanticTokensLegend
} from 'vscode-languageserver/node';

import {fileURLToPath} from 'url';
import {TextDocument} from 'vscode-languageserver-textdocument';
import * as fs from 'fs';
import * as path from 'path';
import {
    Hover,
    HoverParams,
    SemanticTokenModifiers,
    SemanticTokenTypes,
    TextDocumentIdentifier
} from 'vscode-languageserver'

// 创建连接
const connection = createConnection(ProposedFeatures.all);

// 创建文档管理器
const documents = new TextDocuments(TextDocument);


// 将 import.meta.url 转换为本地文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义日志文件路径
const logFilePath = path.join(__dirname, 'temp2222.txt');

console.log(logFilePath); // 输出日志文件的绝对路径
// 日志函数
function log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}${data ? ' - ' + JSON.stringify(data, null, 2) : ''}\n`;
    fs.appendFileSync(logFilePath, logMessage);
    connection.console.log(message);
}

// 初始化日志文件
fs.writeFileSync(logFilePath, '=== LSP Server Started ===\n');

// 定义语义标记类型和修饰符
const tokenTypes = ['class'];
const tokenModifiers: string[] = [];

// 创建语义标记图例
const legend: SemanticTokensLegend = {
    tokenTypes: tokenTypes,
    tokenModifiers: tokenModifiers
};


connection.languages.semanticTokens.on(params => {
    const document = documents.get(params.textDocument.uri);
    if (!document) return {data: []};

    const builder = new SemanticTokensBuilder();
    const text = document.getText();
    const lines = text.split('\n');

    lines.forEach((line, lineIndex) => {
        // 查找 class 关键字
        const classMatch = line.match(/\bclass\b/g);
        if (classMatch) {
            const res = {
                line: lineIndex,
                char: line.indexOf('class'),
                length: 'class'.length,
                tokenType: tokenTypes.indexOf(SemanticTokenTypes.class),  // 使用标准类型
                tokenModifiers: tokenModifiers.indexOf(SemanticTokenModifiers.declaration)  // 使用标准修饰符
            }
            builder.push(
                res.line,
                res.char,
                res.length,
                res.tokenType,
                res.tokenModifiers,
            );
            log('Sending semantic tokens response', res);
        }
    });


    return builder.build();
});

// 处理语义标记请求
/*connection.onRequest(
    'textDocument/semanticTokens/full',
);*/

// 初始化处理
connection.onInitialize((params: InitializeParams): InitializeResult => {
    log('Server initializing with capabilities', {
        capabilities: params.capabilities
    });

    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            semanticTokensProvider: {
                legend,
                full: true,
                range: true
            },
            hoverProvider: true
        }
    };
});

connection.onHover((params: HoverParams): Promise<Hover> => {
    log('Document onHover', {
        uri: params.textDocument.uri
    });
    return Promise.resolve({
        contents: ["Hover Demo qqqq"],
    });
});

// 监听文档变化
documents.onDidChangeContent(change => {
    log('Document changed', {
        uri: change.document.uri,
        version: change.document.version
    });
});

// 监听文档打开
documents.onDidOpen(event => {
    log('Document opened', {
        uri: event.document.uri,
        languageId: event.document.languageId
    });
});

// 启动服务器
documents.listen(connection);
connection.listen();

// 记录未捕获的错误
process.on('uncaughtException', (error) => {
    log('Uncaught Exception', {
        error: error.message,
        stack: error.stack
    });
});

process.on('unhandledRejection', (reason, promise) => {
    log('Unhandled Rejection', {
        reason: reason,
        promise: promise
    });
});
