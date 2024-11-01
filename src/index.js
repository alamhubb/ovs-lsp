import * as fs from 'fs';
import * as path from 'path';

import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    TextDocumentSyncKind,
    SemanticTokensBuilder,
    DidChangeConfigurationNotification,
    CompletionItemKind,
    MarkupKind
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { fileURLToPath } from 'url'

// 在创建连接之前禁用所有控制台输出
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = () => { };
console.error = () => { };


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义文件路径
const filePath = path.join(__dirname, 'temp111.txt');

// 启动时清空文件
try {
    fs.writeFileSync(filePath, '执行了', 'utf8');
    console.log('文件已清空');
} catch (err) {
    console.error('清空文件时出错:', err);
}


// 创建连接
const connection = createConnection(ProposedFeatures.all);

// 创建日志文件
const logFile = path.join(process.cwd(), 'lsp-server.log');

// 重定向日志到文件
const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    fs.appendFileSync(logFile, logMessage, 'utf8');
};

// 恢复并重定向控制台输出
console.log = (message) => {
    log(`INFO: ${message}`);
    connection.console.log(message);
};

console.error = (message) => {
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
const tokenTypes = ['keyword', 'variable', 'string', 'number', 'comment', 'function', 'class'];
const tokenModifiers = ['declaration', 'definition', 'readonly', 'static'];

const tokenTypesLegend = new Map();
tokenTypes.forEach((tokenType, index) => tokenTypesLegend.set(tokenType, index));

const tokenModifiersLegend = new Map();
tokenModifiers.forEach((tokenModifier, index) => tokenModifiersLegend.set(tokenModifier, index));

// 初始化处理
connection.onInitialize((params) => {
    log('Server initializing...');
    log(`Client workspace: ${JSON.stringify(params.workspaceFolders)}`);

    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full,
            // 语义标记支持
            semanticTokensProvider: {
                full: true,
                legend: {
                    tokenTypes,
                    tokenModifiers
                }
            },
            // 代码补全支持
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ['.']
            },
            // 悬停提示支持
            hoverProvider: true
        }
    };
});

// 初始化完成
connection.onInitialized(() => {
    log('Server initialized');
    connection.client.register(DidChangeConfigurationNotification.type);
});

// 处理语义标记请求
connection.onRequest('textDocument/semanticTokens/full',
    (params) => {
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
                // 处理关键词
                keywords.forEach(keyword => {
                    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                    let match;
                    while ((match = regex.exec(line)) !== null) {
                        tokensBuilder.push(
                            lineIndex,
                            match.index,
                            keyword.length,
                            tokenTypesLegend.get('keyword'),
                            0
                        );
                        log(`Found keyword '${keyword}' at line ${lineIndex}, column ${match.index}`);
                    }
                });

                // 处理字符串
                const stringRegex = /'[^']*'|"[^"]*"/g;
                let stringMatch;
                while ((stringMatch = stringRegex.exec(line)) !== null) {
                    tokensBuilder.push(
                        lineIndex,
                        stringMatch.index,
                        stringMatch[0].length,
                        tokenTypesLegend.get('string'),
                        0
                    );
                }

                // 处理数字
                const numberRegex = /\b\d+(\.\d+)?\b/g;
                let numberMatch;
                while ((numberMatch = numberRegex.exec(line)) !== null) {
                    tokensBuilder.push(
                        lineIndex,
                        numberMatch.index,
                        numberMatch[0].length,
                        tokenTypesLegend.get('number'),
                        0
                    );
                }
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

// 代码补全
connection.onCompletion(
    (textDocumentPosition)=> {
        log(`Completion requested at: ${JSON.stringify(textDocumentPosition)}`);
        return keywords.map(keyword => ({
            label: keyword,
            kind: CompletionItemKind.Keyword,
            detail: `Keyword: ${keyword}`,
            documentation: {
                kind: MarkupKind.Markdown,
                value: `Built-in keyword \`${keyword}\``
            }
        }));
    }
);

// 补全项解析
connection.onCompletionResolve(
    (item) => {
        log(`Resolving completion item: ${item.label}`);
        return item;
    }
);

// 悬停提示
connection.onHover(({ textDocument, position }) => {
    log(`Hover requested at: ${textDocument.uri} ${JSON.stringify(position)}`);
    const document = documents.get(textDocument.uri);
    if (!document) {
        return null;
    }

    const text = document.getText();
    const lines = text.split('\n');
    const line = lines[position.line];
    const word = line.slice(
        line.slice(0, position.character).search(/\w+$/),
        line.slice(position.character).search(/\W|$/) + position.character
    );

    if (keywords.includes(word)) {
        return {
            contents: {
                kind: MarkupKind.Markdown,
                value: `**${word}** - Built-in keyword`
            }
        };
    }

    return null;
});

// 文档变化处理
documents.onDidChangeContent(change => {
    // 将请求写入文件
    try {
        // 追加模式写入文件
        fs.appendFileSync(filePath, `${change.document.uri}\n`, 'utf8');
        console.log('内容已写入文件');
    } catch (err) {
        console.error('写入文件时出错:', err);
    }
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

// 添加消息处理的日志
connection.onNotification((method, params) => {
    console.log(`Received notification: ${method}`, params);
});

connection.onRequest((method, params) => {
    console.log(`Received request: ${method}`, params);
    return null;
});

// 监听文档
documents.listen(connection);

// 启动服务器
if (process.argv.includes('--stdio')) {
    log('Starting LSP server in stdio mode...');
    connection.listen();
} else {
    log('Error: --stdio argument is required');
    process.exit(1);
}
