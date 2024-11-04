import type SubhutiCst from "../struct/SubhutiCst.ts";
import {Es6TokenName} from "../syntax/es6/Es6Tokens.ts";
import Es6Parser from "../syntax/es6/Es6Parser.ts";
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
import {checkCstName} from "subhuti/src/parser/SubhutiToAstUtil.ts";


export default class OvsToAstUtil {

    static createOvsRenderDomViewDeclarationAst(cst: SubhutiCst): Identifier {
        const astName = checkCstName(cst, OvsParser.prototype.OvsRenderDomViewDeclaration.name);
        const IdentifierName = cst.children[0]
        const ast: Identifier = {
            type: astName as any,
            name: IdentifierName.value
        }
        return ast
    }


    static createOvsRenderDomViewDeclaratorAst(cst: SubhutiCst): Identifier {
        const astName = checkCstName(cst, OvsParser.prototype.OvsRenderDomViewDeclarator.name);
        const IdentifierName = cst.children[0]
        const ast: Identifier = {
            type: astName as any,
            name: IdentifierName.value
        }
        return ast
    }

    static createOvsLexicalBindingAst(cst: SubhutiCst): Identifier {
        const astName = checkCstName(cst, OvsParser.prototype.OvsLexicalBinding.name);
        const IdentifierName = cst.children[0]
        const ast: Identifier = {
            type: astName as any,
            name: IdentifierName.value
        }
        return ast
    }

}
