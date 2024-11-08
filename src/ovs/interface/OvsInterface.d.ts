import {
    BaseCallExpression,
    BaseClass, BaseDeclaration,
    BaseExpression, BaseForXStatement, BaseFunction,
    BaseModuleDeclaration,
    BaseModuleSpecifier,
    BaseNode,
    BaseNodeWithoutComments,
    BasePattern, BaseStatement,
    ClassBody,
    ClassDeclaration,
    Comment,
    Directive,
    ExportDefaultDeclaration,
    Expression,
    Identifier, MaybeNamedFunctionDeclaration,
    MethodDefinition,
    ModuleDeclaration,
    type Program,
    Property,
    Statement
} from "estree";

export interface OvsAstExportDefaultDeclaration extends ExportDefaultDeclaration {
    export: BaseNode
    default: BaseNode
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


export interface OvsAstBaseNodeWithoutComments {
    // Every leaf interface OvsAstthat extends BaseNode must specify a type property.
    // The type property should be a string literal. For example, Identifier
    // has: OvsAst`type: "Identifier"`
    type: string;
    loc?: OvsAstSourceLocation | null | undefined;
    range?: [number, number] | undefined;
}

export interface OvsAstBaseNode extends BaseNodeWithoutComments {
    leadingComments?: OvsAstComment[] | undefined;
    trailingComments?: OvsAstComment[] | undefined;
}

export interface OvsAstNodeMap {
    AssignmentProperty: OvsAstAssignmentProperty;
    CatchClause: OvsAstCatchClause;
    Class: OvsAstClass;
    ClassBody: OvsAstClassBody;
    Expression: OvsAstExpression;
    Function: Function;
    Identifier: OvsAstIdentifier;
    Literal: OvsAstLiteral;
    MethodDefinition: OvsAstMethodDefinition;
    ModuleDeclaration: OvsAstModuleDeclaration;
    ModuleSpecifier: OvsAstModuleSpecifier;
    Pattern: OvsAstPattern;
    PrivateIdentifier: OvsAstPrivateIdentifier;
    Program: OvsAstProgram;
    Property: OvsAstProperty;
    PropertyDefinition: OvsAstPropertyDefinition;
    SpreadElement: OvsAstSpreadElement;
    Statement: OvsAstStatement;
    Super: OvsAstSuper;
    SwitchCase: OvsAstSwitchCase;
    TemplateElement: OvsAstTemplateElement;
    VariableDeclarator: OvsAstVariableDeclarator;
}

export type OvsAstNode = OvsAstNodeMap[keyof OvsAstNodeMap];

export interface OvsAstComment extends BaseNodeWithoutComments {
    type: "Line" | "Block";
    value: string;
}

export interface OvsAstSourceLocation {
    source?: string | null | undefined;
    start: OvsAstPosition;
    end: OvsAstPosition;
}

export interface OvsAstPosition {
    /** >= OvsAst1 */
    line: number;
    /** >= OvsAst0 */
    column: number;
}

export interface OvsAstProgram extends Program {
    body: Array<OvsAstDirective | OvsAstStatement | OvsAstModuleDeclaration>;
}

export interface OvsAstDirective extends Directive {
    type: "ExpressionStatement";
    expression: OvsAstLiteral;
    directive: string;
}

export interface OvsAstBaseFunction extends BaseNode {
    params: OvsAstPattern[];
    generator?: boolean | undefined;
    async?: boolean | undefined;
    // The body is either BlockStatement or Expression because arrow functions
    // can have a body that's either. FunctionDeclarations and
    // FunctionExpressions have only BlockStatement bodies.
    body: OvsAstBlockStatement | OvsAstExpression;
}

export type OvsAstFunction = OvsAstFunctionDeclaration | OvsAstFunctionExpression | OvsAstArrowFunctionExpression;

export type OvsAstStatement =
    | OvsAstExpressionStatement
    | OvsAstBlockStatement
    | OvsAstStaticBlock
    | OvsAstEmptyStatement
    | OvsAstDebuggerStatement
    | OvsAstWithStatement
    | OvsAstReturnStatement
    | OvsAstLabeledStatement
    | OvsAstBreakStatement
    | OvsAstContinueStatement
    | OvsAstIfStatement
    | OvsAstSwitchStatement
    | OvsAstThrowStatement
    | OvsAstTryStatement
    | OvsAstWhileStatement
    | OvsAstDoWhileStatement
    | OvsAstForStatement
    | OvsAstForInStatement
    | OvsAstForOfStatement
    | OvsAstDeclaration;

export interface OvsAstBaseStatement extends BaseNode {
}

export interface OvsAstEmptyStatement extends BaseStatement {
    type: "EmptyStatement";
}

export interface OvsAstBlockStatement extends BaseStatement {
    type: "BlockStatement";
    body: OvsAstStatement[];
    innerComments?: OvsAstComment[] | undefined;
}

export interface OvsAstStaticBlock extends Omit<OvsAstBlockStatement, "type"> {
    type: "StaticBlock";
}

export interface OvsAstExpressionStatement extends BaseStatement {
    type: "ExpressionStatement";
    expression: OvsAstExpression;
}

export interface OvsAstIfStatement extends BaseStatement {
    type: "IfStatement";
    test: OvsAstExpression;
    consequent: OvsAstStatement;
    alternate?: OvsAstStatement | null | undefined;
}

export interface OvsAstLabeledStatement extends BaseStatement {
    type: "LabeledStatement";
    label: OvsAstIdentifier;
    body: OvsAstStatement;
}

export interface OvsAstBreakStatement extends BaseStatement {
    type: "BreakStatement";
    label?: OvsAstIdentifier | null | undefined;
}

export interface OvsAstContinueStatement extends BaseStatement {
    type: "ContinueStatement";
    label?: OvsAstIdentifier | null | undefined;
}

export interface OvsAstWithStatement extends BaseStatement {
    type: "WithStatement";
    object: OvsAstExpression;
    body: OvsAstStatement;
}

export interface OvsAstSwitchStatement extends BaseStatement {
    type: "SwitchStatement";
    discriminant: OvsAstExpression;
    cases: OvsAstSwitchCase[];
}

export interface OvsAstReturnStatement extends BaseStatement {
    type: "ReturnStatement";
    argument?: OvsAstExpression | null | undefined;
}

export interface OvsAstThrowStatement extends BaseStatement {
    type: "ThrowStatement";
    argument: OvsAstExpression;
}

export interface OvsAstTryStatement extends BaseStatement {
    type: "TryStatement";
    block: OvsAstBlockStatement;
    handler?: OvsAstCatchClause | null | undefined;
    finalizer?: OvsAstBlockStatement | null | undefined;
}

export interface OvsAstWhileStatement extends BaseStatement {
    type: "WhileStatement";
    test: OvsAstExpression;
    body: OvsAstStatement;
}

export interface OvsAstDoWhileStatement extends BaseStatement {
    type: "DoWhileStatement";
    body: OvsAstStatement;
    test: OvsAstExpression;
}

export interface OvsAstForStatement extends BaseStatement {
    type: "ForStatement";
    init?: OvsAstVariableDeclaration | OvsAstExpression | null | undefined;
    test?: OvsAstExpression | null | undefined;
    update?: OvsAstExpression | null | undefined;
    body: OvsAstStatement;
}

export interface OvsAstBaseForXStatement extends BaseStatement {
    left: OvsAstVariableDeclaration | OvsAstPattern;
    right: OvsAstExpression;
    body: OvsAstStatement;
}

export interface OvsAstForInStatement extends BaseForXStatement {
    type: "ForInStatement";
}

export interface OvsAstDebuggerStatement extends BaseStatement {
    type: "DebuggerStatement";
}

export type OvsAstDeclaration = OvsAstFunctionDeclaration | OvsAstVariableDeclaration | OvsAstClassDeclaration;

export interface OvsAstBaseDeclaration extends BaseStatement {
}

export interface OvsAstMaybeNamedFunctionDeclaration extends BaseFunction, BaseDeclaration {

}

export interface OvsAstFunctionDeclaration extends MaybeNamedFunctionDeclaration {
    id: OvsAstIdentifier;
}

export interface OvsAstVariableDeclaration extends BaseDeclaration {
    type: "VariableDeclaration";
    declarations: OvsAstVariableDeclarator[];
    kind: OvsAstSubhutiTokenAst;
}

export interface OvsAstVariableDeclarator extends BaseNode {
    type: "VariableDeclarator";
    id: OvsAstPattern;
    init?: OvsAstExpression | null | undefined;
}

export interface OvsAstExpressionMap {
    ArrayExpression: OvsAstArrayExpression;
    ArrowFunctionExpression: OvsAstArrowFunctionExpression;
    AssignmentExpression: OvsAstAssignmentExpression;
    AwaitExpression: OvsAstAwaitExpression;
    BinaryExpression: OvsAstBinaryExpression;
    CallExpression: OvsAstCallExpression;
    ChainExpression: OvsAstChainExpression;
    ClassExpression: OvsAstClassExpression;
    ConditionalExpression: OvsAstConditionalExpression;
    FunctionExpression: OvsAstFunctionExpression;
    Identifier: OvsAstIdentifier;
    ImportExpression: OvsAstImportExpression;
    Literal: OvsAstLiteral;
    LogicalExpression: OvsAstLogicalExpression;
    MemberExpression: OvsAstMemberExpression;
    MetaProperty: OvsAstMetaProperty;
    NewExpression: OvsAstNewExpression;
    ObjectExpression: OvsAstObjectExpression;
    SequenceExpression: OvsAstSequenceExpression;
    TaggedTemplateExpression: OvsAstTaggedTemplateExpression;
    TemplateLiteral: OvsAstTemplateLiteral;
    ThisExpression: OvsAstThisExpression;
    UnaryExpression: OvsAstUnaryExpression;
    UpdateExpression: OvsAstUpdateExpression;
    YieldExpression: OvsAstYieldExpression;
}

export type OvsAstExpression = OvsAstExpressionMap[keyof OvsAstExpressionMap];

export interface OvsAstBaseExpression extends BaseNode {
}

export type OvsAstChainElement = OvsAstSimpleCallExpression | OvsAstMemberExpression;

export interface OvsAstChainExpression extends BaseExpression {
    type: "ChainExpression";
    expression: OvsAstChainElement;
}

export interface OvsAstThisExpression extends BaseExpression {
    type: "ThisExpression";
}

export interface OvsAstArrayExpression extends BaseExpression {
    type: "ArrayExpression";
    elements: Array<OvsAstExpression | OvsAstSpreadElement | null>;
}

export interface OvsAstObjectExpression extends BaseExpression {
    type: "ObjectExpression";
    properties: Array<OvsAstProperty | OvsAstSpreadElement>;
}

export interface OvsAstPrivateIdentifier extends BaseNode {
    type: "PrivateIdentifier";
    name: string;
}

export interface OvsAstProperty extends BaseNode {
    type: "Property";
    key: OvsAstExpression | OvsAstPrivateIdentifier;
    value: OvsAstExpression | OvsAstPattern; // Could be an AssignmentProperty
    kind: "init" | "get" | "set";
    method: boolean;
    shorthand: boolean;
    computed: boolean;
}

export interface OvsAstPropertyDefinition extends BaseNode {
    type: "PropertyDefinition";
    key: OvsAstExpression | OvsAstPrivateIdentifier;
    value?: OvsAstExpression | null | undefined;
    computed: boolean;
    static: boolean;
}

export interface OvsAstFunctionExpression extends BaseFunction, BaseExpression {

}

export interface OvsAstSequenceExpression extends BaseExpression {
    type: "SequenceExpression";
    expressions: OvsAstExpression[];
}

export interface OvsAstUnaryExpression extends BaseExpression {
    type: "UnaryExpression";
    operator: OvsAstUnaryOperator;
    prefix: true;
    argument: OvsAstExpression;
}

export interface OvsAstBinaryExpression extends BaseExpression {
    type: "BinaryExpression";
    operator: OvsAstBinaryOperator;
    left: OvsAstExpression | OvsAstPrivateIdentifier;
    right: OvsAstExpression;
}

export interface OvsAstAssignmentExpression extends BaseExpression {
    type: "AssignmentExpression";
    operator: OvsAstAssignmentOperator;
    left: OvsAstPattern | OvsAstMemberExpression;
    right: OvsAstExpression;
}

export interface OvsAstUpdateExpression extends BaseExpression {
    type: "UpdateExpression";
    operator: OvsAstUpdateOperator;
    argument: OvsAstExpression;
    prefix: boolean;
}

export interface OvsAstLogicalExpression extends BaseExpression {
    type: "LogicalExpression";
    operator: OvsAstLogicalOperator;
    left: OvsAstExpression;
    right: OvsAstExpression;
}

export interface OvsAstConditionalExpression extends BaseExpression {
    type: "ConditionalExpression";
    test: OvsAstExpression;
    alternate: OvsAstExpression;
    consequent: OvsAstExpression;
}

export interface OvsAstBaseCallExpression extends BaseExpression {
    callee: OvsAstExpression | OvsAstSuper;
    arguments: Array<OvsAstExpression | OvsAstSpreadElement>;
}

export type OvsAstCallExpression = OvsAstSimpleCallExpression | OvsAstNewExpression;

export interface OvsAstSimpleCallExpression extends BaseCallExpression {
    type: "CallExpression";
    optional: boolean;
}

export interface OvsAstNewExpression extends BaseCallExpression {
    type: "NewExpression";
}

export interface OvsAstMemberExpression extends BaseExpression, BasePattern {
    type: "MemberExpression";
    object: OvsAstExpression | OvsAstSuper;
    property: OvsAstExpression | OvsAstPrivateIdentifier;
    computed: boolean;
    optional: boolean;
}

export type OvsAstPattern =
    OvsAstIdentifier
    | OvsAstObjectPattern
    | OvsAstArrayPattern
    | OvsAstRestElement
    | OvsAstAssignmentPattern
    | OvsAstMemberExpression;

export interface OvsAstBasePattern extends BaseNode {
}

export interface OvsAstSwitchCase extends BaseNode {
    type: "SwitchCase";
    test?: OvsAstExpression | null | undefined;
    consequent: OvsAstStatement[];
}

export interface OvsAstCatchClause extends BaseNode {
    type: "CatchClause";
    param: OvsAstPattern | null;
    body: OvsAstBlockStatement;
}

export interface OvsAstIdentifier extends BaseNode, BaseExpression, BasePattern {
    type: "Identifier";
    name: string;
}

export type OvsAstLiteral = OvsAstSimpleLiteral | RegExpLiteral | bigintLiteral;

export interface OvsAstSimpleLiteral extends BaseNode, BaseExpression {
    type: "Literal";
    value: string | boolean | number | null;
    raw?: string | undefined;
}

export interface RegExpLiteral extends BaseNode, BaseExpression {
    type: "Literal";
    value?: RegExp | null | undefined;
    regex: {
        pattern: string;
        flags: string;
    };
    raw?: string | undefined;
}

export interface bigintLiteral extends BaseNode, BaseExpression {
    type: "Literal";
    value?: bigint | null | undefined;
    bigint: string;
    raw?: string | undefined;
}

export type OvsAstUnaryOperator = "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";

export type OvsAstBinaryOperator =
    | "=="
    | "!="
    | "==="
    | "!=="
    | "<"
    | "<="
    | ">"
    | ">="
    | "<<"
    | ">>"
    | ">>>"
    | "+"
    | "-"
    | "*"
    | "/"
    | "%"
    | "**"
    | "|"
    | "^"
    | "&"
    | "in"
    | "instanceof";

export type OvsAstLogicalOperator = "||" | "&&" | "??";

export type OvsAstAssignmentOperator =
    | "="
    | "+="
    | "-="
    | "*="
    | "/="
    | "%="
    | "**="
    | "<<="
    | ">>="
    | ">>>="
    | "|="
    | "^="
    | "&="
    | "||="
    | "&&="
    | "??=";

export type OvsAstUpdateOperator = "++" | "--";

export interface OvsAstForOfStatement extends BaseForXStatement {
    type: "ForOfStatement";
    await: boolean;
}

export interface OvsAstSuper extends BaseNode {
    type: "Super";
}

export interface OvsAstSpreadElement extends BaseNode {
    type: "SpreadElement";
    argument: OvsAstExpression;
}

export interface OvsAstArrowFunctionExpression extends BaseExpression, BaseFunction {
    type: "ArrowFunctionExpression";
    expression: boolean;
    body: OvsAstBlockStatement | OvsAstExpression;
}

export interface OvsAstYieldExpression extends BaseExpression {
    type: "YieldExpression";
    argument?: OvsAstExpression | null | undefined;
    delegate: boolean;
}

export interface OvsAstTemplateLiteral extends BaseExpression {
    type: "TemplateLiteral";
    quasis: OvsAstTemplateElement[];
    expressions: OvsAstExpression[];
}

export interface OvsAstTaggedTemplateExpression extends BaseExpression {
    type: "TaggedTemplateExpression";
    tag: OvsAstExpression;
    quasi: OvsAstTemplateLiteral;
}

export interface OvsAstTemplateElement extends BaseNode {
    type: "TemplateElement";
    tail: boolean;
    value: {
        /** It is null when the template literal is tagged and the text has an invalid escape (e.g. - tag`\unicode and \u{55}`) */
        cooked?: string | null | undefined;
        raw: string;
    };
}

export interface OvsAstAssignmentProperty extends Property {

}

export interface OvsAstObjectPattern extends BasePattern {
    type: "ObjectPattern";
    properties: Array<OvsAstAssignmentProperty | OvsAstRestElement>;
}

export interface OvsAstArrayPattern extends BasePattern {
    type: "ArrayPattern";
    elements: Array<OvsAstPattern | null>;
}

export interface OvsAstRestElement extends BasePattern {
    type: "RestElement";
    argument: OvsAstPattern;
}

export interface OvsAstAssignmentPattern extends BasePattern {
    type: "AssignmentPattern";
    left: OvsAstPattern;
    right: OvsAstExpression;
}

export type OvsAstClass = OvsAstClassDeclaration | OvsAstClassExpression;

export interface OvsAstBaseClass extends BaseNode {
    superClass?: OvsAstExpression | null | undefined;
    body: OvsAstClassBody;
}

export interface OvsAstClassBody extends BaseNode {
    type: "ClassBody";
    body: Array<OvsAstMethodDefinition | OvsAstPropertyDefinition | OvsAstStaticBlock>;
}

export interface OvsAstMethodDefinition extends MethodDefinition {
    staticToken: BaseNode
}

export interface OvsAstMaybeNamedClassDeclaration extends BaseClass, BaseDeclaration {
    type: "ClassDeclaration";
    /** It is null when a class declaration is a part of the `export default class` statement */
    id: OvsAstIdentifier | null;
}

export interface OvsAstClassDeclaration extends ClassDeclaration {
    class: BaseNode
}

export interface OvsAstClassExpression extends BaseClass, BaseExpression {
    type: "ClassExpression";
    id?: OvsAstIdentifier | null | undefined;
}

export interface OvsAstMetaProperty extends BaseExpression {
    type: "MetaProperty";
    meta: OvsAstIdentifier;
    property: OvsAstIdentifier;
}

export type OvsAstModuleDeclaration =
    | OvsAstImportDeclaration
    | OvsAstExportNamedDeclaration
    | OvsAstExportDeclaration
    | OvsAstExportAllDeclaration;

export interface OvsAstBaseModuleDeclaration extends BaseNode {
}

export type OvsAstModuleSpecifier =
    OvsAstImportSpecifier
    | OvsAstImportDefaultSpecifier
    | OvsAstImportNamespaceSpecifier
    | OvsAstExportSpecifier;

export interface OvsAstBaseModuleSpecifier extends BaseNode {
    local: OvsAstIdentifier;
}

export interface OvsAstImportDeclaration extends BaseModuleDeclaration {
    type: "ImportDeclaration";
    specifiers: Array<OvsAstImportSpecifier | OvsAstImportDefaultSpecifier | OvsAstImportNamespaceSpecifier>;
    source: OvsAstLiteral;
}

export interface OvsAstImportSpecifier extends BaseModuleSpecifier {
    type: "ImportSpecifier";
    imported: OvsAstIdentifier | OvsAstLiteral;
}

export interface OvsAstImportExpression extends BaseExpression {
    type: "ImportExpression";
    source: OvsAstExpression;
}

export interface OvsAstImportDefaultSpecifier extends BaseModuleSpecifier {
    type: "ImportDefaultSpecifier";
}

export interface OvsAstImportNamespaceSpecifier extends BaseModuleSpecifier {
    type: "ImportNamespaceSpecifier";
}

export interface OvsAstExportNamedDeclaration extends BaseModuleDeclaration {
    type: "ExportNamedDeclaration";
    declaration?: OvsAstDeclaration | null | undefined;
    specifiers: OvsAstExportSpecifier[];
    source?: OvsAstLiteral | null | undefined;
}

export interface OvsAstExportSpecifier extends Omit<OvsAstBaseModuleSpecifier, "local"> {
    type: "ExportSpecifier";
    local: OvsAstIdentifier | OvsAstLiteral;
    exported: OvsAstIdentifier | OvsAstLiteral;
}

export interface OvsAstSubhutiTokenAst extends BaseNodeWithoutComments {

}

export interface OvsAstExportDeclaration extends BaseModuleDeclaration {
    type: "ExportDeclaration";
    export: OvsAstSubhutiTokenAst
    default: OvsAstSubhutiTokenAst
    declaration: OvsAstMaybeNamedFunctionDeclaration | OvsAstMaybeNamedClassDeclaration | OvsAstExpression;
}

export interface OvsAstExportAllDeclaration extends BaseModuleDeclaration {
    type: "ExportAllDeclaration";
    exported: OvsAstIdentifier | OvsAstLiteral | null;
    source: OvsAstLiteral;
}

export interface OvsAstAwaitExpression extends BaseExpression {
    type: "AwaitExpression";
    argument: OvsAstExpression;
}
