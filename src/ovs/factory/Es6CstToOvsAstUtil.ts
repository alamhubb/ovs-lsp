import * as babeType from "@babel/types";
import OvsParser from "../parser/OvsParser.ts";
import Es6CstToEstreeAstUtil, {
    checkCstName,
    EsTreeAstType, throwNewError
} from "subhuti-ts/src/language/es2015/Es6CstToEstreeAstUtil.ts";
import {
    OvsAstLexicalBinding,
    OvsAstRenderDomViewDeclaration, OvsRenderDomViewDeclarator
} from "../interface/OvsInterface";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import SubhutiLexer from "subhuti/src/parser/SubhutiLexer.ts";
import Es6TokenConsumer, {es6Tokens} from "subhuti-ts/src/language/es2015/Es6Tokens.ts";
import type {
    CallExpression, ExpressionStatement,
    AssignmentExpression,
    ClassDeclaration,
    Directive,
    ExportDefaultDeclaration,
    Expression,
    ModuleDeclaration,
    Program,
    Statement
} from "@babel/types";
import Es6Parser from "subhuti-ts/src/language/es2015/Es6Parser.ts";
import BabelEstreeAstUtil from "./BabelEstreeAstUtil.ts";
import JsonUtil from "subhuti/src/utils/JsonUtil.ts";


export default class Es6CstToOvsAstUtil extends Es6CstToEstreeAstUtil {
    toAst(code: string) {
        const lexer = new SubhutiLexer(es6Tokens)
        const tokens = lexer.lexer(code)
        const parser = new OvsParser(tokens)

        let curCst = parser.Program()

        const ast = this.createProgramAst(curCst)

        // JsonUtil.log(ast)
        return ast
    }

    createProgramAst(cst: SubhutiCst): Program {
        const ast = super.createProgramAst(cst)
        return ast
    }

    createSubhutiTokenAst(cst: SubhutiCst): any {
        return {
            type: cst.value,
            loc: cst.loc
        }
    }

    createExportDeclarationAst(cst: SubhutiCst): ExportDefaultDeclaration {
        let astName = checkCstName(cst, Es6Parser.prototype.ExportDeclaration.name);
        const {children} = cst;
        const [exportToken, secondChild, thirdChild] = children;

        JsonUtil.log(cst)

        let ast: ExportDefaultDeclaration = super.createExportDeclarationAst(cst) as ExportDefaultDeclaration
        /*

        if (ast.type === EsTreeAstType.ExportDefaultDeclaration) {
            console.log(ast.type)
            ast = {
                export: this.createSubhutiTokenAst(exportToken),
                default: this.createSubhutiTokenAst(secondChild),
                ...ast
            }
        }*/
        return ast
    }

    createClassDeclarationAst(cst: SubhutiCst): ClassDeclaration {
        const astName = checkCstName(cst, Es6Parser.prototype.ClassDeclaration.name);
        const baseAst = super.createClassDeclarationAst(cst);

        // 创建新对象，包含所有需要的属性
        const ast: ClassDeclaration = {
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


    createOvsRenderDomViewDeclarationAst(cst: SubhutiCst): CallExpression {
        const astName = checkCstName(cst, OvsParser.prototype.OvsRenderDomViewDeclaration.name);
        const ast: OvsAstRenderDomViewDeclaration = {
            type: astName as any,
            id: this.createIdentifierAst(cst.children[0]) as any,
            // children: cst.children[2].children.filter(item => item.name === OvsParser.prototype.OvsRenderDomViewDeclarator.name),
            children: cst.children[2].children.filter(item => item.name === OvsParser.prototype.OvsRenderDomViewDeclarator.name).map(item => this.createOvsRenderDomViewDeclaratorAst(item)) as any[],
            // children: this.createAssignmentExpressionAst(cst.children[2])
        } as any

        const res = BabelEstreeAstUtil.createOvsRenderDomViewDeclarationEstreeAst(ast)
        // left = this.ovsRenderDomViewDeclarationAstToEstreeAst(left)
        return res
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

export const ovsToAstUtil = new Es6CstToOvsAstUtil()
