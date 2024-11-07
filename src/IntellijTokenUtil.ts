import {
    BaseNode,
    BlockStatement, CallExpression, ClassBody,
    ClassDeclaration, ExportDeclaration,
    Expression, ExpressionStatement, FunctionExpression,
    Identifier,
    Literal, MemberExpression, MethodDefinition, Pattern,
    Program,
    SourceLocation, type SubhutiTokenAst,
    VariableDeclaration,
    VariableDeclarator
} from "subhuti/src/struct/SubhutiEs6Ast.ts";
import Es6Parser from "subhuti/src/syntax/es6/Es6Parser.ts";
import Es6TokenConsumer, {
    es6TokenMapObj,
    Es6TokenName,
    es6Tokens,
    es6TokensObj
} from "subhuti/src/syntax/es6/Es6Tokens.ts";
import {SubhutiCreateToken} from "subhuti/src/struct/SubhutiCreateToken.ts";
import OvsParser from "./ovs/parser/OvsParser.ts";
import {OvsLexicalBinding, OvsRenderDomViewDeclaration} from "./ovs/interface/OvsInterface";
import {esTreeAstType} from "subhuti/src/parser/SubhutiToAstUtil.ts";

export default class IntellijTokenUtil {
    tokenHandler(ast: Program) {

    }
}

class SemanticToken {
    line: number;    // token 类型
    char: number;   // 开始位置
    length: number;  // 长度
    tokenType: number;    // 文本内容
    tokenModifiers: number;    // 文本内容

    constructor(loc: SourceLocation, tokenType: number) {
        this.line = loc.start.line;
        this.char = loc.start.column;
        this.length = loc.end.column - loc.start.column;
        this.tokenType = tokenType;
        this.tokenModifiers = 0;
    }
}

export const tokenTypesObj = {
    identifier: "Identifier",
    LOCAL_VARIABLE: "LOCAL_VARIABLE",
    FUNCTION_DECLARATION: "FUNCTION_DECLARATION",
    FUNCTION_CALL: "FUNCTION_CALL",
    CLASS_NAME: "CLASS_NAME",
    PARAMETER: "PARAMETER",

    keyword: "keyword",
    string: "string",
    number: "number",
}

// 定义语义标记类型和修饰符
const tokenTypes = Object.values(tokenTypesObj)

const tokenTypeIndexObj = Object.fromEntries(tokenTypes.map((token, index) => [token, index]))

export class TokenProvider {
    static tokens: SemanticToken[] = [];

    private static getTokens(ast: any): SemanticToken[] {
        this.tokens = [];
        this.visitNode(ast);
        return this.tokens;
    }

    private static visitProgram(node: Program) {
        node.body.forEach(item => this.visitNode(item))
    }

    private static visitExportDeclaration(node: ExportDeclaration) {
        this.addToken(this.createSemanticTokenByTokenName(node.export))
        if (node.default) {
            this.addToken(this.createSemanticTokenByTokenName(node.default))
        }
        this.visitNode(node.declaration)
    }

    private static visitClassDeclaration(node: ClassDeclaration) {
        this.addToken(this.createSemanticTokenByTokenName(node.class))
        this.visitIdentifier(node.id, tokenTypesObj.CLASS_NAME)
        this.visitNode(node.body)
    }

    private static visitClassBody(node: ClassBody) {
        for (const bodyElement of node.body) {
            this.visitNode(bodyElement)
        }
    }

    private static visitMethodDefinition(node: MethodDefinition) {
        if (node.static) {
            this.addToken(this.createSemanticTokenByTokenName(node.static))
        }
        this.visitIdentifier(node.key as any, tokenTypesObj.CLASS_NAME)
        this.visitNode(node.value)
    }

    private static visitFunctionExpression(node: FunctionExpression) {
        for (const param of node.params) {
            this.visitIdentifier(param, tokenTypesObj.PARAMETER)
        }
        this.visitNode(node.body)
    }

    private static visitBlockStatement(node: BlockStatement) {
        for (const bodyElement of node.body) {
            this.visitNode(bodyElement)
        }
    }

    private static visitExpressionStatement(node: ExpressionStatement) {
        this.visitNode(node.expression)
    }

    private static visitCallExpression(node: CallExpression) {
        this.visitNode(node.callee)
        for (const argument of node.arguments) {
            this.visitNode(argument)
        }
    }

    private static visitMemberExpression(node: MemberExpression) {
        this.visitNode(node.object)
        this.visitNode(node.property)
    }

    private static getTokenTypeIndex(tokenValue: string) {
        //tokenType, cst.name
        return tokenTypeIndexObj[tokenValue]
    }

    //判断是不是keyword
    static getTokenType(tokenName: string) {
        const token: SubhutiCreateToken = es6TokenMapObj[tokenName]
        if (!token) {
            throw new Error('token not exist:' + tokenName)
        }
        if (token.isKeyword) {
            return tokenTypesObj.keyword
        }
        return token.name
    }

    private static createSemanticTokenByTokenName(token: SubhutiTokenAst): SemanticToken {
        const tokenType = this.getTokenType(token.type)
        return this.createSemanticToken(token.loc, tokenType)
    }

    private static createSemanticToken(loc: SourceLocation, tokenType: string): SemanticToken {
        const tokenTypeIndex = this.getTokenTypeIndex(tokenType)
        const token = new SemanticToken(loc, tokenTypeIndex)
        return token
    }

    private static visitVariableDeclaration(node: VariableDeclaration) {
        this.addToken(this.createSemanticTokenByTokenName(node.kind))
        node.declarations.forEach(item => this.visitNode(item))
    }

    private static visitVariableDeclarator(node: VariableDeclarator) {
        this.visitIdentifier(node.id, tokenTypesObj.LOCAL_VARIABLE);
        this.visitNode(node.init)
    }

    private static visitIdentifier(node: Pattern, tokenType: string) {
        this.addToken(this.createSemanticToken(node.loc, tokenType))
    }

    private static visitOvsRenderDomViewDeclaration(node: OvsRenderDomViewDeclaration) {
        this.visitIdentifier(node.id, tokenTypesObj.FUNCTION_CALL);
        node.children.forEach(item => this.visitNode(item))
    }

    private static visitOvsLexicalBinding(node: OvsLexicalBinding) {
        this.visitIdentifier(node.id, tokenTypesObj.LOCAL_VARIABLE);
        this.visitNode(node.init)
    }

    private static visitLiteral(node: Literal) {
        const nodeValueType = typeof node.value
        let tokenType: string
        if (nodeValueType === 'boolean') {
            tokenType = tokenTypesObj.keyword
        } else if (nodeValueType === 'string') {
            tokenType = tokenTypesObj.string
        } else {
            tokenType = tokenTypesObj.number
        }
        this.addToken(this.createSemanticToken(node.loc, tokenType))
    }


    static visitNode(node: any) {
        console.log(node.type)
        switch (node.type) {
            case OvsParser.prototype.Program.name:
                this.visitProgram(node)
                break;
            case OvsParser.prototype.ExportDeclaration.name:
                this.visitExportDeclaration(node)
                break;
            case OvsParser.prototype.ClassDeclaration.name:
                this.visitClassDeclaration(node)
                break;
            case OvsParser.prototype.ClassBody.name:
                this.visitClassBody(node)
                break;
            case OvsParser.prototype.MethodDefinition.name:
                this.visitMethodDefinition(node)
                break;
            case OvsParser.prototype.FunctionExpression.name:
                this.visitFunctionExpression(node)
                break;
            case OvsParser.prototype.BlockStatement.name:
                this.visitBlockStatement(node)
                break;
            case OvsParser.prototype.ExpressionStatement.name:
                this.visitExpressionStatement(node)
                break;
            case OvsParser.prototype.CallExpression.name:
                this.visitCallExpression(node)
                break;
            case OvsParser.prototype.MemberExpression.name:
                this.visitMemberExpression(node)
                break;
            case OvsParser.prototype.VariableDeclaration.name:
                this.visitVariableDeclaration(node)
                break;
            case OvsParser.prototype.VariableDeclarator.name:
                this.visitVariableDeclarator(node);
                break;
            case OvsParser.prototype.OvsRenderDomViewDeclaration.name:
                this.visitOvsRenderDomViewDeclaration(node);
                break;
            case OvsParser.prototype.OvsLexicalBinding.name:
                this.visitOvsLexicalBinding(node);
                break;
            case OvsParser.prototype.Literal.name:
                this.visitLiteral(node);
                break;
        }
    }

    private static addToken(token: SemanticToken) {
        this.tokens.push(token)
    }
}
