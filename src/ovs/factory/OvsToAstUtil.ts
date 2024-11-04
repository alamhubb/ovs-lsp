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
import {OvsRenderDomViewDeclaration} from "../interface/OvsInterface";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import SubhutiToAstHandler from "subhuti/src/parser/SubhutiToAstUtil.ts";


export default class OvsToAstHandler extends SubhutiToAstHandler {

    createExpressionAst(cst: SubhutiCst): Expression {
        const astName = cst.name
        console.trace('jinrule xreadfs0' + cst)
        console.log(cst)
        let left
        if (astName === OvsParser.prototype.OvsRenderDomViewDeclaration.name) {
            left = OvsToAstUtil.createOvsRenderDomViewDeclarationAst(cst)
        } else {
            return super.createExpressionAst(cst)
        }
        return left
    }

    createOvsRenderDomViewDeclarationAst(cst: SubhutiCst): OvsRenderDomViewDeclaration {
        const astName = checkCstName(cst, OvsParser.prototype.OvsRenderDomViewDeclaration.name);
        const IdentifierName = cst.children[0]
        const ast: OvsRenderDomViewDeclaration = {
            type: astName as any,
            id: cst.children[0] as any,
            children: cst.children[2].children.map(item => OvsToAstUtil.createOvsRenderDomViewDeclaratorAst(item)) as any[],
        } as any
        return ast
    }


    createOvsRenderDomViewDeclaratorAst(cst: SubhutiCst): Expression {
        const astName = checkCstName(cst, OvsParser.prototype.OvsRenderDomViewDeclarator.name);

        const firstChild = cst.children[0]
        if (firstChild.name === OvsParser.prototype.OvsLexicalBinding.name) {
            const ast: VariableDeclarator = {
                type: astName as any,
                id: SubhutiToAstUtil.createIdentifierAst(cst.children[0].children[0]) as any,
                init: SubhutiToAstUtil.createAssignmentExpressionAst(cst.children[1].children[1]) as any,
            }
            return ast as any
        } else {
            return OvsToAstUtil.createExpressionAst(firstChild)
        }
    }
}

export const OvsToAstUtil = new OvsToAstHandler()
