import Es6TokenConsumer, {
    es6TokenMapObj,
    Es6TokenName,
    es6Tokens,
    es6TokensObj
} from "subhuti-ts/src/language/es2015/Es6Tokens.ts";
import {SubhutiCreateToken} from "subhuti/src/struct/SubhutiCreateToken.ts";
import OvsParser from "./ovs/parser/OvsParser.ts";
import {
    OvsAstClassDeclaration, OvsAstExportDefaultDeclaration,
    OvsAstLexicalBinding, OvsAstMethodDefinition,
    OvsAstRenderDomViewDeclaration
} from "./ovs/interface/OvsInterface";
import {EsTreeAstType} from "subhuti-ts/src/language/es2015/Es6CstToEstreeAstUtil.ts";
import {SourceLocation} from "subhuti/src/struct/SubhutiCst.ts";
import {Program} from "estree";
import {LogUtil} from "./logutil.ts";

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

    private static visitExportDefaultDeclaration(node: OvsAstExportDefaultDeclaration) {
        this.addToken(this.createSemanticToken(node.export))
        if (node.default) {
            this.addToken(this.createSemanticToken(node.default))
        }
        this.visitNode(node.declaration)
    }

    private static visitClassDeclaration(node: OvsAstClassDeclaration) {
        this.addToken(this.createSemanticToken(node.class))
        this.visitIdentifier(node.id)
        this.visitNode(node.body)
    }

    private static visitClassBody(node: OvsAstClassBody) {
        for (const bodyElement of node.body) {
            this.visitNode(bodyElement)
        }
    }

    private static visitMethodDefinition(node: OvsAstMethodDefinition) {
        if (node.staticToken) {
            this.addToken(this.createSemanticToken(node.staticToken))
        }
        this.visitNode(node.key)
        this.visitNode(node.value)
    }

    private static visitFunctionExpression(node: OvsAstFunctionExpression) {
        for (const param of node.params) {
            this.visitIdentifier(param)
        }
        this.visitNode(node.body)
    }

    private static visitBlockStatement(node: OvsAstBlockStatement) {
        for (const bodyElement of node.body) {
            this.visitNode(bodyElement)
        }
    }

    private static visitExpressionStatement(node: OvsAstExpressionStatement) {
        this.visitNode(node.expression)
    }

    private static visitCallExpression(node: OvsAstCallExpression) {
        this.visitNode(node.callee)
        for (const argument of node.arguments) {
            this.visitNode(argument)
        }
    }

    private static visitMemberExpression(node: OvsAstMemberExpression) {
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


    private static visitVariableDeclaration(node: OvsAstVariableDeclaration) {
        this.addToken(this.createSemanticToken(node.kind))
        node.declarations.forEach(item => this.visitNode(item))
    }

    private static visitVariableDeclarator(node: OvsAstVariableDeclarator) {
        this.visitIdentifier(node.id);
        this.visitNode(node.init)
    }

    private static visitIdentifier(node: OvsAstPattern) {
        this.addToken(this.createSemanticToken(node))
    }


    private static createSemanticToken(token: OvsAstTokenAst): SemanticToken {
        console.log(token)
        let tokenType = es6TokenMapObj[token.type]?.isKeyword ? tokenTypesObj.keyword : token.type
        const tokenTypeIndex = tokenTypeIndexObj[tokenType]
        return new SemanticToken(token.loc, tokenTypeIndex)
    }


    private static visitOvsRenderDomViewDeclaration(node: OvsAstRenderDomViewDeclaration) {
        this.visitIdentifier(node.id);
        node.children.forEach(item => this.visitNode(item))
    }

    private static visitOvsLexicalBinding(node: OvsAstLexicalBinding) {
        this.visitIdentifier(node.id);
        this.visitNode(node.init)
    }

    private static visitLiteral(node: OvsAstLiteral) {
        const nodeValueType = typeof node.value
        let tokenType: string
        if (nodeValueType === 'boolean') {
            tokenType = tokenTypesObj.keyword
        } else if (nodeValueType === 'string') {
            tokenType = tokenTypesObj.string
        } else {
            tokenType = tokenTypesObj.number
        }
        this.addToken(this.createSemanticToken({
            ...node,
            type: tokenType
        }))
    }


    static visitNode(node: any) {
        // LogUtil.log('jinru node')
        // LogUtil.log(node)
        // LogUtil.log('666666')
        switch (node.type) {
            case OvsParser.prototype.Program.name:
                this.visitProgram(node)
                break;
            case EsTreeAstType.ExportDefaultDeclaration:
                this.visitExportDefaultDeclaration(node)
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
            case Es6TokenConsumer.prototype.Identifier.name:
                this.visitIdentifier(node);
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
