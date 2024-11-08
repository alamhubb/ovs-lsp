import {OvsAstExpression, OvsAstIdentifier} from "./OvsEs6Ast.ts";

export interface OvsRenderDomViewDeclaration {
    type: "OvsRenderDomViewDeclaration",
    id: OvsAstIdentifier
    children: OvsRenderDomViewDeclaration[];
    arguments: OvsAstExpression [  ];
}

export interface OvsLexicalBinding {
    type: "OvsLexicalBinding",
    id: OvsAstIdentifier
    init?: OvsAstExpression | null | undefined;
}
