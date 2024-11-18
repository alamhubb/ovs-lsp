import * as babeType from "@babel/types";
import {OvsAstIdentifier, OvsRenderDomViewDeclarator} from "../interface/OvsInterface";
import {Statement} from '@babel/types';

export default class BabelEstreeAstUtil {

    static createOvsRenderDomViewDeclarationEstreeAst(id: OvsAstIdentifier, children: OvsRenderDomViewDeclarator[]) {
        const body = BabelEstreeAstUtil.createOvsAPICreateVNode(id, children)
    }

    static createIIFE(body: Array<Statement>) {
        const blockStatement = babeType.blockStatement(body)
        const functionExpression = babeType.functionExpression(null, [], blockStatement)
        const callExpression = babeType.callExpression(functionExpression, [])
        const ExpressionStatement = babeType.expressionStatement(callExpression)
    }

    static createOvsAPICreateVNode(id: OvsAstIdentifier, children: OvsRenderDomViewDeclarator[]) {
        const memberExpressionObject = babeType.identifier('OvsAPI')
        const memberExpressionProperty = babeType.identifier('createVNode')
        const memberExpression = babeType.memberExpression(memberExpressionObject, memberExpressionProperty)
        const OvsAPICreateVNodeFirstParamsViewName = babeType.stringLiteral(id.name)
        const callExpression = babeType.callExpression(memberExpression, [OvsAPICreateVNodeFirstParamsViewName, children])
        const ReturnStatement = babeType.returnStatement(callExpression)

        return ReturnStatement
    }
}
