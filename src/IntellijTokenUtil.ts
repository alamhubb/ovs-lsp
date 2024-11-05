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
import {es6TokenMapObj, es6Tokens, es6TokensObj} from "subhuti/src/syntax/es6/Es6Tokens.ts";
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


    constructor(line: number, char: number, length: number, tokenType: number, tokenModifiers: number) {
        this.line = line;
        this.char = char;
        this.length = length;
        this.tokenType = tokenType;
        this.tokenModifiers = tokenModifiers;
    }
}

const tokenTypesObj = {
    Keyword: "Keyword",
    Identifier: "Identifier",
}

// 定义语义标记类型和修饰符
const tokenTypes = Object.keys(tokenTypesObj)

const tokenTypeIndexObj = Object.fromEntries(tokenTypes.map((token, index) => [token, index]))

class TokenProvider {
    private tokens: SemanticToken[] = [];

    getTokens(ast: any): SemanticToken[] {
        this.tokens = [];
        this.visitNode(ast);
        return this.tokens;
    }

    visitProgram(node: Program) {
        node.body.forEach(item => this.visitNode(item))
    }


    getTokenTypeIndex(tokenValue: string) {
        const token: SubhutiCreateToken = es6TokenMapObj[tokenValue]
        if (!token) {
            throw new Error('token not exist')
        }
        if (token.isKeyword) {
            return tokenTypeIndexObj[tokenTypesObj.Keyword]
        }
        return
    }

    createSemanticToken(loc: SourceLocation, tokenType: string): SemanticToken {
        const tokenTypeIndex = this.getTokenTypeIndex(tokenType)
        const token = new SemanticToken(loc.start.line, loc.start.column, loc.end.column - loc.start.column, tokenTypeIndex, 0)
        return token
    }

    visitVariableDeclaration(node: VariableDeclaration) {
        this.addToken(this.createSemanticToken(node.loc, node.kind))
        node.declarations.forEach(item => this.visitNode(item))
    }

    visitVariableDeclarator(node: VariableDeclarator) {
        this.visitNode(node.id)
        this.visitNode(node.init)
    }

    visitIdentifier(node: Identifier) {
        this.addToken(this.createSemanticToken(node.loc, node.type))
    }

    visitOvsRenderDomViewDeclaration(node: OvsRenderDomViewDeclaration) {
        this.visitNode(node.id)
        node.children.forEach(item => this.visitNode(item))
    }

    visitOvsLexicalBinding(node: OvsLexicalBinding) {
        this.visitNode(node.id)
        this.visitNode(node.init)
    }

    visitLiteral(node: Literal) {
        const nodeValueType = typeof node.value
        let tokenType: string
        if (nodeValueType === 'boolean') {
            tokenType = String(node.value)
        } else if (nodeValueType === 'string') {
            tokenType = nodeValueType
        } else {
            tokenType = 'number'
        }
        this.addToken(this.createSemanticToken(node.loc, tokenType))
    }


    private visitNode(node: any) {
        switch (node.type) {
            case OvsParser.prototype.Program.name:
                this.visitProgram(node)
                break;
            case OvsParser.prototype.VariableDeclaration.name:
                this.visitVariableDeclaration(node)
                break;
            case OvsParser.prototype.VariableDeclarator.name:
                this.visitVariableDeclarator(node.id);
                break;
            case OvsParser.prototype.Identifier.name:
                this.visitIdentifier(node.id);
                break;
            case OvsParser.prototype.OvsRenderDomViewDeclaration.name:
                this.visitOvsRenderDomViewDeclaration(node.id);
                break;
            case OvsParser.prototype.OvsLexicalBinding.name:
                this.visitOvsLexicalBinding(node.id);
                break;
            case OvsParser.prototype.Literal.name:
                this.visitLiteral(node.id);
                break;
        }
    }

    private addToken(token: SemanticToken) {
        this.tokens.push(token)
    }
}
