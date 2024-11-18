import * as t from '@babel/types';
import generate from '@babel/generator';

// 1. 创建 AST
function createAST() {
  // 创建一个简单的程序 AST
  const ast = t.program([
    // const x = 42
    t.variableDeclaration('const', [
      t.variableDeclarator(
          t.identifier('x'),
          t.numericLiteral(42)
      )
    ]),

    // function add(a, b) { return a + b }
    t.functionDeclaration(
        t.identifier('add'),
        [t.identifier('a'), t.identifier('b')],
        t.blockStatement([
          t.returnStatement(
              t.binaryExpression('+',
                  t.identifier('a'),
                  t.identifier('b')
              )
          )
        ])
    )
  ]);

  return ast;
}

// 2. 生成代码
function generateCode(ast: babel.types.Node) {
  const output = generate.default(ast, {
    retainLines: true,
    comments: true,
    compact: false,
    semicolons: false,  // 禁用分号
  }, {});

  return output.code;
}

// 3. 使用示例
const ast = createAST();
const code = generateCode(ast);
console.log(code);
