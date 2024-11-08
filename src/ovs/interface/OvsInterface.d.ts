import {
    BaseNode, ClassBody, ClassDeclaration,
    ExportDefaultDeclaration, Expression, Identifier, MethodDefinition, type Program
} from "estree";

export interface OvsAstProgram extends Program {
}

export interface OvsAstExportDefaultDeclaration extends ExportDefaultDeclaration {
    export: BaseNode
    default: BaseNode
}

export interface OvsAstMethodDefinition extends MethodDefinition {
    staticToken: BaseNode
}

export interface OvsAstClassDeclaration extends ClassDeclaration {
    class: BaseNode
}

export interface OvsAstRenderDomViewDeclaration {
    type: "OvsRenderDomViewDeclaration",
    id: Identifier
    children: OvsAstRenderDomViewDeclaration[];
    arguments: Expression [  ];
}

export interface OvsAstLexicalBinding {
    type: "OvsLexicalBinding",
    id: Identifier
    init?: Expression | null | undefined;
}
