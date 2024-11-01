#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    TextDocumentSyncKind,
    InitializeResult,
    SemanticTokensParams,
    SemanticTokensBuilder
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

// 获取 __dirname 等价物
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义文件路径
const logFile = path.join(__dirname, 'lsp-server.log');

// 创建连接
const connection = createConnection(ProposedFeatures.all, process.stdin, process.stdout);

// 重定向日志到文件
const log = (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    fs.appendFileSync(logFile, logMessage, 'utf8');
};

// 替换 console 方法
console.log = (message: string) => {
    log(`INFO: ${message}`);
    connection.console.log(message);
};
console.error = (message: string) => {
    log(`ERROR: ${message}`);
    connection.console.error(message);
};

// 创建文档管理器
const documents = new TextDocuments(TextDocument);

// 定义要高亮的关键词
const keywords = [
    'function', 'if', 'else', 'return', 'while', 'for', 'break', 'continue',
    'let', 'const', 'var', 'class', 'extends', 'new', 'this', 'super'
];

// 定义语义标记类型
const tokenTypes = ['keyword'];
const tokenTypesLegend = new Map<string, number>();
tokenTypes.forEach((tokenType, index) => tokenTypesLegend.set(tokenType, index));

// 初始化处理
connection.onInitialize((params: InitializeParams): InitializeResult => {
    log('Server initializing...');
    log(`Client workspace: ${JSON.stringify(params.workspaceFolders)}`);

    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full,
            semanticTokensProvider: {
                full: true,
                legend: {
                    tokenTypes,
                    tokenModifiers: []
                }
            }
        }
    };
});

// 初始化完成
connection.onInitialized(() => {
    log('Server initialized');
});

// 处理语义标记请求
connection.onRequest('textDocument/semanticTokens/full',
    (params: SemanticTokensParams) => {
        log(`Semantic tokens requested for: ${params.textDocument.uri}`);

        const document = documents.get(params.textDocument.uri);
        if (!document) {
            log(`Document not found: ${params.textDocument.uri}`);
            return { data: [] };
        }

        try {
            const tokensBuilder = new SemanticTokensBuilder();
            const text = document.getText();
            const lines = text.split('\n');

            lines.forEach((line, lineIndex) => {
                keywords.forEach(keyword => {
                    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                    let match;
                    while ((match = regex.exec(line)) !== null) {
                        tokensBuilder.push(
                            lineIndex,
                            match.index,
                            keyword.length,
                            tokenTypesLegend.get('keyword')!,
                            0
                        );
                        log(`Found keyword '${keyword}' at line ${lineIndex}, column ${match.index}`);
                    }
                });
            });

            const tokens = tokensBuilder.build();
            log(`Returning ${tokens.data.length / 5} tokens`);
            return tokens;
        } catch (error) {
            log(`Error processing semantic tokens: ${error}`);
            return { data: [] };
        }
    }
);

// 文档变化处理
documents.onDidChangeContent(change => {
    log(`Document changed: ${change.document.uri}`);
});

// 错误处理
process.on('uncaughtException', (error) => {
    log(`Uncaught Exception: ${error.stack || error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled Rejection at: ${promise}\nReason: ${reason}`);
});

// 关闭处理
connection.onExit(() => {
    log('LSP Server shutting down');
});

connection.onShutdown(() => {
    log('LSP Server shutdown requested');
    return undefined;
});

// 监听文档
documents.listen(connection);

// 启动服务器
log('Starting LSP server...');
connection.listen();
