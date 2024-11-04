import {BaseExpression, BaseNode, BasePattern, type Expression, Identifier, type Pattern} from "estree";
import {OvsToAstUtil} from "../factory/OvsToAstUtil.ts";

export interface OvsRenderDomViewDeclaration {
    type: "OvsRenderDomViewDeclaration",
    id: Identifier
    children: OvsRenderDomViewDeclaration[];
    arguments: Expression [  ];
    init?: Expression | null | undefined;
}

export interface OvsLexicalBinding {
    type: "OvsLexicalBinding",
    id: Identifier
    init?: Expression | null | undefined;
}
