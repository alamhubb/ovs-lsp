import * as babeType from "@babel/types";
import {OvsAstIdentifier, OvsAstRenderDomViewDeclaration, OvsRenderDomViewDeclarator} from "../interface/OvsInterface";
import {ExpressionStatement, Statement} from '@babel/types';

export default class BabelEstreeAstUtil {
    static createOvsRenderDomViewDeclarationEstreeAst(ast: OvsAstRenderDomViewDeclaration): ExpressionStatement {
        const body = BabelEstreeAstUtil.createOvsAPICreateVNode(ast)
        const viewIIFE = BabelEstreeAstUtil.createIIFE(body)
        return viewIIFE
    }

    static createIIFE(body: Array<Statement>) {
        const blockStatement = babeType.blockStatement(body)
        const functionExpression = babeType.functionExpression(null, [], blockStatement)
        const callExpression = babeType.callExpression(functionExpression, [])
        const ExpressionStatement = babeType.expressionStatement(callExpression)
        return ExpressionStatement
    }

    static createOvsAPICreateVNode(ast: OvsAstRenderDomViewDeclaration): Statement[] {
        const memberExpressionObject = babeType.identifier('OvsAPI')
        const memberExpressionProperty = babeType.identifier('createVNode')
        const memberExpression = babeType.memberExpression(memberExpressionObject, memberExpressionProperty)
        const OvsAPICreateVNodeFirstParamsViewName = babeType.stringLiteral(ast.id.name)
        const callExpression = babeType.callExpression(memberExpression, [OvsAPICreateVNodeFirstParamsViewName, ast.children])
        const ReturnStatement = babeType.returnStatement(callExpression)

        return [ReturnStatement]
    }
}
