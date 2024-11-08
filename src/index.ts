import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    TextDocumentSyncKind,
    InitializeParams,
    InitializeResult,
    SemanticTokensRequest,
    SemanticTokensBuilder,
    SemanticTokensLegend, CompletionItem, CompletionItemKind, MarkupKind
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
import OvsToAstHandler, {OvsToAstUtil} from "./ovs/factory/OvsToAstUtil.ts";
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

interface objtype {
    label: string,
    type: number,
    file: string,
    default: boolean
}

const completionMap: Map<string, objtype> = new Map()

function initCompletionMap(filePath: string) {
    const files = FileUtil.getAllFiles(filePath);
    for (const file of files) {
        console.log(file)
        const fileCode = FileUtil.readFileContent(file)
        console.log(fileCode)
        const ast = OvsToAstHandler.toAst(fileCode)
        if (ast.sourceType === 'module') {
            for (const bodyElement of ast.body) {
                if (bodyElement.type === 'ExportDeclaration') {
                    if (bodyElement.declaration.type === 'ClassDeclaration') {
                        completionMap.set(bodyElement.declaration.id.name, {
                            label: bodyElement.declaration.id.name,
                            type: CompletionItemKind.Class,
                            file: file,
                            default: !!bodyElement.default,
                        })
                    }
                }
            }
        }
    }
}

// 修改初始化处理
connection.onInitialize((params: InitializeParams): InitializeResult => {
    // LogUtil.log('Server initializing with capabilities', {
    //     capabilities: params.capabilities
    // });

    // 确保工作区文件夹存在
    if (params.workspaceFolders && params.workspaceFolders.length > 0) {
        const files = FileUtil.getAllFiles(params.workspaceFolders[0].uri);
        LogUtil.log('Workspace files:', files);
    }

    return {
        capabilities: {
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


connection.languages.semanticTokens.on(params => {
    const document = documents.get(params.textDocument.uri)

    if (!document) {
        LogUtil.log('chufale kong' + params.textDocument.uri + 'fasfd')
        return {data: []}
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

    if (tokens1.length) {
        for (const semanticToken of tokens1) {
            builder.push(
                semanticToken.line,
                semanticToken.char,
                semanticToken.length,
                semanticToken.tokenType,
                semanticToken.tokenModifiers,
            )
        }
    } else {
        LogUtil.log('chufale kong' + text + 'fasfd')
    }

    const build = builder.build()
    return build
})

// 1. 基本补全请求处理
connection.onCompletion(
    (params: CompletionParams): CompletionItem[] => {
        LogUtil.log(params)
        // 返回基本的补全列表
        return [
            {
                label: 'someFunction',
                kind: CompletionItemKind.Function,
                data: 1  // 可以传递给 resolve 的数据
            }
        ];
    }
);

// 2. 补全项解析处理 - 对应 completionItem/resolve
connection.onCompletionResolve(
    (item: CompletionItem): CompletionItem => {
        // 根据 item.data 加载详细信息
        if (item.data === 1) {
            item.detail = 'Function details';
            item.documentation = {
                kind: MarkupKind.Markdown,
                value: '# Documentation\n...'
            };
        }
        return item;
    }
);

// 启动服务器
documents.listen(connection)
connection.listen()
