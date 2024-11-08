import OvsParser from "../parser/OvsParser.ts";
import Es6CstToEstreeAstUtil, {
    checkCstName,
    EsTreeAstType, throwNewError
} from "subhuti-ts/src/language/es2015/Es6CstToEstreeAstUtil.ts";
import {
    OvsAstClassDeclaration,
    OvsAstExportDefaultDeclaration,
    OvsAstLexicalBinding, OvsAstProgram,
    OvsAstRenderDomViewDeclaration
} from "../interface/OvsInterface";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import SubhutiLexer from "subhuti/src/parser/SubhutiLexer.ts";
import {es6Tokens} from "subhuti-ts/src/language/es2015/Es6Tokens.ts";
import type {
    ClassDeclaration,
    Directive,
    ExportDefaultDeclaration,
    Expression,
    ModuleDeclaration,
    Program,
    Statement
} from "estree";
import Es6Parser from "subhuti-ts/src/language/es2015/Es6Parser.ts";
import {BaseNode} from "estree";


export default class OvsToAstUtil extends Es6CstToEstreeAstUtil {
    toAst(code: string) {
        const lexer = new SubhutiLexer(es6Tokens)
        const tokens = lexer.lexer(code)
        const parser = new OvsParser(tokens)

        let curCst = parser.Program()

        const ast = this.createProgramAst(curCst)

        // JsonUtil.log(ast)
        return ast
    }

    createProgramAst(cst: SubhutiCst): OvsAstProgram {
        const ast = this.createProgramAst(cst)
        return ast as OvsAstProgram
    }

    createSubhutiTokenAst(cst: SubhutiCst): BaseNode {
        return {
            type: cst.value,
            loc: cst.loc
        }
    }

    createExportDeclarationAst(cst: SubhutiCst): OvsAstExportDefaultDeclaration {
        let astName = checkCstName(cst, Es6Parser.prototype.ExportDeclaration.name);
        const {children} = cst;
        const [exportToken, secondChild, thirdChild] = children;

        let ast: OvsAstExportDefaultDeclaration = super.createExportDeclarationAst(cst) as OvsAstExportDefaultDeclaration

        if (ast.type === EsTreeAstType.ExportDefaultDeclaration) {
            ast = {
                export: this.createSubhutiTokenAst(exportToken),
                default: this.createSubhutiTokenAst(secondChild),
                ...ast
            }
        }
        return ast
    }

    createClassDeclarationAst(cst: SubhutiCst): OvsAstClassDeclaration {
        const astName = checkCstName(cst, Es6Parser.prototype.ClassDeclaration.name);
        const baseAst = super.createClassDeclarationAst(cst);

        // 创建新对象，包含所有需要的属性
        const ast: OvsAstClassDeclaration = {
            ...baseAst,
            class: this.createSubhutiTokenAst(cst.children[0])
        };
        return ast;
    }

    createExpressionAst(cst: SubhutiCst): Expression {
        const astName = cst.name
        let left
        if (astName === OvsParser.prototype.OvsRenderDomViewDeclaration.name) {
            left = this.createOvsRenderDomViewDeclarationAst(cst)
        } else {
            return super.createExpressionAst(cst)
        }
        return left
    }

    createOvsRenderDomViewDeclarationAst(cst: SubhutiCst): OvsAstRenderDomViewDeclaration {
        const astName = checkCstName(cst, OvsParser.prototype.OvsRenderDomViewDeclaration.name);
        const ast: OvsAstRenderDomViewDeclaration = {
            type: astName as any,
            id: this.createIdentifierAst(cst.children[0]) as any,
            children: cst.children[2].children.filter(item => item.name === OvsParser.prototype.OvsRenderDomViewDeclarator.name).map(item => this.createOvsRenderDomViewDeclaratorAst(item)) as any[],
            // children: this.createAssignmentExpressionAst(cst.children[2])
        } as any
        return ast
    }

    createOvsRenderDomViewDeclaratorAst(cst: SubhutiCst): OvsAstLexicalBinding | Expression {
        const astName = checkCstName(cst, OvsParser.prototype.OvsRenderDomViewDeclarator.name);
        const firstChild = cst.children[0]
        if (firstChild.name === OvsParser.prototype.OvsLexicalBinding.name) {
            const ast: OvsAstLexicalBinding = {
                type: OvsParser.prototype.OvsLexicalBinding.name as any,
                id: this.createIdentifierAst(firstChild.children[0].children[0]) as any,
                init: this.createAssignmentExpressionAst(firstChild.children[1].children[1]) as any,
            }
            return ast as any
        } else {
            return this.createAssignmentExpressionAst(firstChild)
        }
    }

}

export const ovsToAstUtil = new OvsToAstUtil()
