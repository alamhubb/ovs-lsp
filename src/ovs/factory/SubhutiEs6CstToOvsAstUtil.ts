import type SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import Es6TokenConsumer, {Es6TokenName, es6TokensObj} from "subhuti-ts/src/language/es2015/Es6Tokens.ts";
import Es6Parser from "subhuti-ts/src/language/es2015/Es6Parser.ts";
import type {
    OvsAstAssignmentExpression,
    OvsAstAssignmentOperator,
    OvsAstBlockStatement,
    OvsAstCallExpression,
    OvsAstClassBody,
    OvsAstClassDeclaration,
    OvsAstComment,
    OvsAstConditionalExpression,
    OvsAstDeclaration,
    OvsAstDirective,
    OvsAstExportDeclaration,
    OvsAstExpression,
    OvsAstExpressionMap,
    OvsAstExpressionStatement,
    OvsAstFunctionExpression,
    OvsAstIdentifier,
    OvsAstLiteral,
    OvsAstMemberExpression,
    OvsAstMethodDefinition,
    OvsAstModuleDeclaration,
    OvsAstNode,
    OvsAstNodeMap,
    OvsAstPattern,
    OvsAstProgram,
    OvsAstPropertyDefinition, OvsAstSourceLocation,
    OvsAstStatement,
    OvsAstStaticBlock, OvsAstSubhutiTokenAst,
    OvsAstVariableDeclaration,
    OvsAstVariableDeclarator
} from "../interface/OvsEs6Ast.ts";
import Es6CstToEstreeAstUtil from "subhuti-ts/src/language/es2015/Es6CstToEstreeAstUtil.ts";

export function checkCstName(cst: SubhutiCst, cstName: string) {
    if (cst.name !== cstName) {
        console.log(cst)
        throwNewError(cst.name)
    }
    return cstName
}

export function throwNewError(errorMsg: string = 'syntax error') {
    throw new Error(errorMsg)
}

export default class SubhutiEs6CstToOvsAstUtil extends Es6CstToEstreeAstUtil  {

}

export const es6CstToSubhutiEs6AstUtil = new SubhutiEs6CstToOvsAstUtil()
