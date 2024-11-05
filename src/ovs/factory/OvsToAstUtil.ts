import type {
    Comment,
    Directive, Expression, ExpressionMap,
    Identifier,
    ModuleDeclaration,
    Node, Pattern,
    Program,
    Statement,
    VariableDeclaration, VariableDeclarator
} from "estree";
import OvsParser from "../parser/OvsParser.ts";
import {checkCstName, SubhutiToAstUtil} from "subhuti/src/parser/SubhutiToAstUtil.ts";
import {OvsLexicalBinding, OvsRenderDomViewDeclaration} from "../interface/OvsInterface";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import SubhutiToAstHandler from "subhuti/src/parser/SubhutiToAstUtil.ts";


export default class OvsToAstHandler extends SubhutiToAstHandler {

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

    createOvsRenderDomViewDeclarationAst(cst: SubhutiCst): OvsRenderDomViewDeclaration {
        const astName = checkCstName(cst, OvsParser.prototype.OvsRenderDomViewDeclaration.name);
        const ast: OvsRenderDomViewDeclaration = {
            type: astName as any,
            id: this.createIdentifierAst(cst.children[0]) as any,
            children: cst.children[2].children.filter(item => item.name === OvsParser.prototype.OvsRenderDomViewDeclarator.name).map(item => this.createOvsRenderDomViewDeclaratorAst(item)) as any[],
            // children: this.createAssignmentExpressionAst(cst.children[2])
        } as any
        return ast
    }

    createOvsRenderDomViewDeclaratorAst(cst: SubhutiCst): OvsLexicalBinding | Expression {
        const astName = checkCstName(cst, OvsParser.prototype.OvsRenderDomViewDeclarator.name);
        const firstChild = cst.children[0]
        if (firstChild.name === OvsParser.prototype.OvsLexicalBinding.name) {
            const ast: OvsLexicalBinding = {
                type: OvsParser.prototype.OvsLexicalBinding as any,
                id: this.createIdentifierAst(firstChild.children[0].children[0]) as any,
                init: this.createAssignmentExpressionAst(firstChild.children[1].children[1]) as any,
            }
            return ast as any
        } else {
            return this.createAssignmentExpressionAst(firstChild)
        }
    }
}

export const OvsToAstUtil = new OvsToAstHandler()
