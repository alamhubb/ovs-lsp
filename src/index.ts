import * as fs from 'fs';
import * as path from 'path';

import {
    Range,
    createConnection,
    TextDocuments,
    ProposedFeatures,
    TextDocumentSyncKind,
    SemanticTokensBuilder,
    DidChangeConfigurationNotification,
    CompletionItemKind,
    MarkupKind,
    InitializeParams,
    TextDocumentChangeEvent
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { fileURLToPath } from 'url'
import { DiagnosticSeverity, Position } from 'vscode-languageserver'

// 定义日志级别
enum LogLevel {
    Error = 0,
    Warn = 1,
    Info = 2,
    Debug = 3
}

// 定义服务器配置接口
interface ServerConfiguration {
    enableRedHighlight: boolean;
    highlightColor: string;
}

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义日志文件路径
const logFilePath = path.join(__dirname, 'temp111.txt');

// 初始化日志文件
try {
    fs.writeFileSync(logFilePath, '=== LSP Server Log Started ===\n', 'utf8');
} catch (err) {
    console.error(`Failed to create log file: ${err}`);
}

// 全局配置
let globalSettings: ServerConfiguration = {
    enableRedHighlight: true,
    highlightColor: 'red'
};

// 创建连接
const connection = createConnection(ProposedFeatures.all);

// 创建文档管理器
const documents = new TextDocuments(TextDocument);

// 统一的日志函数
function log(message: string, level: LogLevel = LogLevel.Info, details?: any) {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    let logMessage = `${timestamp} [${levelStr}] - ${message}\n`;

    // 如果有详细信息，添加到日志中
    if (details) {
        logMessage += `Details: ${JSON.stringify(details, null, 2)}\n`;
    }

    try {
        fs.appendFileSync(logFilePath, logMessage, 'utf8');

        // 同时发送到 LSP 客户端
        switch (level) {
            case LogLevel.Error:
                connection.console.error(message);
                break;
            case LogLevel.Warn:
                connection.console.warn(message);
                break;
            default:
                connection.console.log(message);
        }
    } catch (err) {
        console.error(`Failed to write to log file: ${err}`);
    }
}

// 错误处理函数
function handleError(error: Error, context: string) {
    const errorDetails = {
        context,
        message: error.message,
        stack: error.stack || 'No stack trace available'
    };

    log(`Error in ${context}`, LogLevel.Error, errorDetails);
    connection.window.showErrorMessage(`Error in ${context}: ${error.message}`);
}

// 文档验证函数
async function validateDocument(document: TextDocument): Promise<void> {
    if (!globalSettings.enableRedHighlight) {
        log('Red highlighting is disabled', LogLevel.Info);
        return;
    }

    try {
        const text = document.getText();
        log(`Processing document`, LogLevel.Debug, {
            uri: document.uri,
            contentLength: text.length,
            lineCount: document.lineCount
        });

        const lines = text.split('\n');
        const lastLine = document.lineCount - 1;
        const lastLineLength = lines[lastLine].length;

        const range = Range.create(
          Position.create(1, 0),
          Position.create(1, lastLineLength)
        );

        const diagnostic = {
            severity: DiagnosticSeverity.Error,
            range: range,
            message: "File content marked as red123123",
            source: 'red-highlighter'
        };

        log(`Sending diagnostics`, LogLevel.Debug, {
            uri: document.uri,
            diagnostic: diagnostic
        });

        connection.sendDiagnostics({
            uri: document.uri,
            diagnostics: [diagnostic]
        });

    } catch (err) {
        handleError(err as Error, 'validateDocument');
    }
}

// 初始化处理
connection.onInitialize((params: InitializeParams) => {
    log('Server initializing...', LogLevel.Info, params);

    return {
        capabilities: {
            textDocumentSync: {
                openClose: true,
                change: TextDocumentSyncKind.Full,
                willSave: true,
                willSaveWaitUntil: true,
                save: {
                    includeText: true
                }
            },
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ['.']
            },
            hoverProvider: true
        }
    };
});

// 初始化完成
connection.onInitialized(() => {
    log('Server initialized', LogLevel.Info);
    connection.client.register(DidChangeConfigurationNotification.type);
});

// 配置变更处理
connection.onDidChangeConfiguration(change => {
    log('Configuration changed', LogLevel.Info, change.settings);

    if (change.settings.redHighlighter) {
        globalSettings = change.settings.redHighlighter as ServerConfiguration;
        // 重新验证所有打开的文档
        documents.all().forEach(validateDocument);
    }
});

// 文档变化处理
documents.onDidChangeContent((change: TextDocumentChangeEvent<TextDocument>) => {
    log(`Document changed`, LogLevel.Info, {
        uri: change.document.uri,
        version: change.document.version
    });
    validateDocument(change.document);
});

// 文档生命周期处理
documents.onDidOpen(event => {
    log(`Document opened`, LogLevel.Info, {
        uri: event.document.uri
    });
    validateDocument(event.document);
});

documents.onDidSave(event => {
    log(`Document saved`, LogLevel.Info, {
        uri: event.document.uri
    });
    validateDocument(event.document);
});

documents.onDidClose(event => {
    log(`Document closed`, LogLevel.Info, {
        uri: event.document.uri
    });
    // 清除诊断信息
    connection.sendDiagnostics({
        uri: event.document.uri,
        diagnostics: []
    });
});

// 代码补全
connection.onCompletion((textDocumentPosition) => {
    log(`Completion requested`, LogLevel.Info, textDocumentPosition);
    return [];
});

// 悬停提示
connection.onHover(({ textDocument, position }) => {
    log(`Hover requested`, LogLevel.Info, {
        uri: textDocument.uri,
        position: position
    });
    return null;
});

// 错误处理
process.on('uncaughtException', (error) => {
    handleError(error, 'uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    const reasonStr = reason instanceof Error ? reason.stack : String(reason);
    log(`Unhandled Rejection`, LogLevel.Error, {
        promise: promise,
        reason: reasonStr
    });
});

// 关闭处理
connection.onExit(() => {
    log('LSP Server shutting down', LogLevel.Info);
});

connection.onShutdown(() => {
    log('LSP Server shutdown requested', LogLevel.Info);
    return undefined;
});

// 消息处理日志
connection.onNotification((method, params) => {
    log(`Received notification`, LogLevel.Debug, {
        method: method,
        params: params
    });
});

connection.onRequest((method, params) => {
    log(`Received request`, LogLevel.Debug, {
        method: method,
        params: params
    });
    return null;
});

// 监听文档
documents.listen(connection);

// 启动服务器
if (process.argv.includes('--stdio')) {
    log('Starting LSP server in stdio mode...', LogLevel.Info);
    connection.listen();
} else {
    log('Missing --stdio argument', LogLevel.Error);
    process.exit(1);
}
