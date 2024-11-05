import {
    Expression,
    Identifier,
    Literal,
    Program,
    SourceLocation,
    VariableDeclaration,
    VariableDeclarator
} from "estree";
import Es6Parser from "subhuti/src/syntax/es6/Es6Parser.ts";
import Es6TokenConsumer, {es6TokenMapObj, es6Tokens, es6TokensObj} from "subhuti/src/syntax/es6/Es6Tokens.ts";
import {SubhutiCreateToken} from "subhuti/src/struct/SubhutiCreateToken.ts";
import OvsParser from "./ovs/parser/OvsParser.ts";
import {OvsLexicalBinding, OvsRenderDomViewDeclaration} from "./ovs/interface/OvsInterface";

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

const tokenTypesObj = {
    identifier: "IdentifierName",

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


    private static getTokenTypeIndex(tokenValue: string) {
        //tokenType, cst.name
        return tokenTypeIndexObj[tokenValue]
    }

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

    private static createSemanticTokenByTokenName(loc: SourceLocation, tokenName: string): SemanticToken {
        const tokenType = this.getTokenType(tokenName)
        return this.createSemanticToken(loc, tokenType)
    }

    private static createSemanticToken(loc: SourceLocation, tokenType: string): SemanticToken {
        const tokenTypeIndex = this.getTokenTypeIndex(tokenType)
        const token = new SemanticToken(loc, tokenTypeIndex)
        return token
    }

    private static visitVariableDeclaration(node: VariableDeclaration) {
        const loc: SourceLocation = {
            start: node.loc.start,
            end: {
                line: node.loc.start.line,
                column: node.loc.start.column + node.kind.length,
            }
        }

        this.addToken(this.createSemanticTokenByTokenName(loc, node.kind))
        node.declarations.forEach(item => this.visitNode(item))
    }

    private static visitVariableDeclarator(node: VariableDeclarator) {
        console.log('visitVariableDeclarator')
        this.visitNode(node.id)
        this.visitNode(node.init)
    }

    private static visitIdentifier(node: Identifier) {
        console.log('identiti')
        this.addToken(this.createSemanticToken(node.loc, node.type))
    }

    private static visitOvsRenderDomViewDeclaration(node: OvsRenderDomViewDeclaration) {
        console.log('visitOvsRenderDomViewDeclaration')
        this.visitNode(node.id)
        node.children.forEach(item => this.visitNode(item))
    }

    private static visitOvsLexicalBinding(node: OvsLexicalBinding) {
        console.log('visitOvsLexicalBinding')
        this.visitNode(node.id)
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
        switch (node.type) {
            case OvsParser.prototype.Program.name:
                this.visitProgram(node)
                break;
            case OvsParser.prototype.VariableDeclaration.name:
                this.visitVariableDeclaration(node)
                break;
            case OvsParser.prototype.VariableDeclarator.name:
                this.visitVariableDeclarator(node);
                break;
            case Es6TokenConsumer.prototype.Identifier.name:
                this.visitIdentifier(node);
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
        console.log('jinru')
        this.tokens.push(token)
    }
}
