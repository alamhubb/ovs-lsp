#!/usr/bin/env node

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

// 创建连接
const connection = createConnection(ProposedFeatures.all);
console.log('Language Server Started');

// 创建文档管理器
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

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

// 处理语义标记请求
connection.onRequest('textDocument/semanticTokens/full',
    (params: SemanticTokensParams) => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return { data: [] };
        }

        const tokensBuilder = new SemanticTokensBuilder();
        const text = document.getText();
        const lines = text.split('\n');

        lines.forEach((line, lineIndex) => {
            // 处理关键词
            keywords.forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                let match;
                while ((match = regex.exec(line)) !== null) {
                    tokensBuilder.push(
                        lineIndex,                    // 行号
                        match.index,                  // 列号
                        keyword.length,               // 长度
                        tokenTypesLegend.get('keyword')!, // 类型（关键词）
                        0                             // 修饰符
                );
                }
            });
        });

        return tokensBuilder.build();
    }
);

// 监听文档
documents.listen(connection);

// 启动服务器
connection.listen();
