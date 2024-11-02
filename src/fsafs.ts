import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  InitializeParams,
  InitializeResult,
  SemanticTokensBuilder,
  SemanticTokensLegend,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

// 创建连接
const connection = createConnection(ProposedFeatures.all);

// 创建文档管理器
const documents = new TextDocuments(TextDocument);

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
    return {
      data: []
    };
  }

  const builder = new SemanticTokensBuilder();
  const text = document.getText();
  const lines = text.split('\n');

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
      }
    });
  });

  return builder.build();
});

// 初始化处理
connection.onInitialize((params: InitializeParams): InitializeResult => {
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
  connection.languages.semanticTokens.refresh();
});

// 监听文档和连接
documents.listen(connection);
connection.listen();
