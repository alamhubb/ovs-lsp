import {BaseExpression, BaseNode, BasePattern, type Expression, Identifier, type Pattern} from "estree";

export interface OvsRenderDomViewDeclaration {
    type: "OvsRenderDomViewDeclaration",
    id: Identifier
    children: OvsRenderDomViewDeclaration[];
    arguments: Expression [  ];
    init?: Expression | null | undefined;
}
