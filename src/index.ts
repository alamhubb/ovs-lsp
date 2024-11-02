// src/server.ts
import * as fs from 'fs';
import * as path from 'path';

import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    TextDocumentSyncKind,
    InitializeParams,
    InitializeResult,
    SemanticTokensBuilder,
    SemanticTokensLegend
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

// 创建连接
const connection = createConnection(ProposedFeatures.all);

// 创建文档管理器
const documents = new TextDocuments(TextDocument);

// 定义日志文件路径
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, 'temp111.txt');

// 初始化日志文件
try {
    fs.writeFileSync(logFilePath, '=== LSP Server Log Started ===\n', 'utf8');
} catch (err) {
    console.error(`Failed to create log file: ${err}`);
}

// 日志记录函数
function log(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
    connection.console.log(message);
}

// 定义语义标记类型和修饰符
const tokenTypes = ['class'];
const tokenModifiers: string[] = [];

// 创建语义标记图例
const legend: SemanticTokensLegend = {
    tokenTypes: tokenTypes,
    tokenModifiers: tokenModifiers
};

// 注册语义标记处理器
connection.languages.semanticTokens.on((params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        log(`No document found for URI: ${params.textDocument.uri}`);
        return {
            data: []
        };
    }

    const builder = new SemanticTokensBuilder();
    const text = document.getText();
    const lines = text.split('\n');

    log(`Processing document: ${params.textDocument.uri}`);

    // 定义要高亮的关键词
    const keywords = ['class'];

    lines.forEach((line, lineIndex) => {
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            let match;
            while ((match = regex.exec(line)) !== null) {
                builder.push(
                  lineIndex,                           // 行号
                  match.index,                         // 列号
                  keyword.length,                      // 长度
                  tokenTypes.indexOf('class'),         // token 类型
                  0                                     // 修饰符
                );
                log(`Found keyword '${keyword}' at line ${lineIndex}, column ${match.index}`);
            }
        });
    });

    const tokens = builder.build();
    log(`Sending ${tokens.data.length / 5} semantic tokens for ${params.textDocument.uri}`);
    return tokens;
});

// 初始化处理
connection.onInitialize((params: InitializeParams): InitializeResult => {
    log('Initializing LSP server...');
    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            semanticTokensProvider: {
                legend: legend,
                full: true,
                range: false
            }
        }
    };
    return result;
});

// 文档变化处理
documents.onDidChangeContent(change => {
    log(`Document changed: ${change.document.uri}`);
    connection.languages.semanticTokens.refresh();
});

// 监听文档和连接
documents.listen(connection);
connection.listen();
