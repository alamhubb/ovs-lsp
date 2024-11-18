import {AssignmentExpression, Expression, Identifier} from '@babel/types';

// 自定义声明类型
export interface OvsAstRenderDomViewDeclaration {
    type: "OvsRenderDomViewDeclaration";
    id: Identifier;
    children: OvsAstAssignmentExpression[];
    arguments: Expression[];
}

export interface OvsAstLexicalBinding {
    type: "OvsLexicalBinding";
    id: Identifier;
    init?: Expression | null | undefined;
}

export type OvsRenderDomViewDeclarator =
// | OvsAstLexicalBinding
    | OvsAstAssignmentExpression

// Expression 相关接口继续
export interface OvsAstAssignmentExpression extends AssignmentExpression {
    type: "AssignmentExpression";
    operator: string;
    right: Expression;
}

