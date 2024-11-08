// This definition file follows a somewhat unusual format. ESTree allows
// runtime type checks based on the `type` parameter. In order to explain this
// to typescript we want to use discriminated union types:
// https://github.com/Microsoft/TypeScript/pull/9163
//
// For ESTree this is a bit tricky because the high level interfaces like
// Node or Function are pulling double duty. We want to pass common fields down
// to the interfaces that extend them (like Identifier or
// ArrowFunctionExpression), but you can't extend a type union or enforce
// common fields on them. So we've split the high level interfaces into two
// types, a base type which passes down inherited fields, and a type union of
// all types which extend the base type. Only the type union is exported, and
// the union is how other types refer to the collection of inheriting types.
//
// This makes the definitions file here somewhat more difficult to maintain,
// but it has the notable advantage of making ESTree much easier to use as
// an end user.


export interface OvsAstBaseNodeWithoutComments {
    // Every leaf interface OvsAstthat extends OvsAstBaseNode must specify a type property.
    // The type property should be a string literal. For example, Identifier
    // has: OvsAst`type: "Identifier"`
    type: string;
    loc?: OvsAstSourceLocation | null | undefined;
    range?: [number, number] | undefined;
}

export interface OvsAstBaseNode extends OvsAstBaseNodeWithoutComments {
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

export interface OvsAstComment extends OvsAstBaseNodeWithoutComments {
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

export interface OvsAstProgram extends OvsAstBaseNode {
    type: "Program";
    sourceType: "script" | "module";
    body: Array<OvsAstDirective | OvsAstStatement | OvsAstModuleDeclaration>;
    comments?: OvsAstComment[] | undefined;
}

export interface OvsAstDirective extends OvsAstBaseNode {
    type: "ExpressionStatement";
    expression: OvsAstLiteral;
    directive: string;
}

export interface OvsAstBaseFunction extends OvsAstBaseNode {
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

export interface OvsAstBaseStatement extends OvsAstBaseNode {
}

export interface OvsAstEmptyStatement extends OvsAstBaseStatement {
    type: "EmptyStatement";
}

export interface OvsAstBlockStatement extends OvsAstBaseStatement {
    type: "BlockStatement";
    body: OvsAstStatement[];
    innerComments?: OvsAstComment[] | undefined;
}

export interface OvsAstStaticBlock extends Omit<OvsAstBlockStatement, "type"> {
    type: "StaticBlock";
}

export interface OvsAstExpressionStatement extends OvsAstBaseStatement {
    type: "ExpressionStatement";
    expression: OvsAstExpression;
}

export interface OvsAstIfStatement extends OvsAstBaseStatement {
    type: "IfStatement";
    test: OvsAstExpression;
    consequent: OvsAstStatement;
    alternate?: OvsAstStatement | null | undefined;
}

export interface OvsAstLabeledStatement extends OvsAstBaseStatement {
    type: "LabeledStatement";
    label: OvsAstIdentifier;
    body: OvsAstStatement;
}

export interface OvsAstBreakStatement extends OvsAstBaseStatement {
    type: "BreakStatement";
    label?: OvsAstIdentifier | null | undefined;
}

export interface OvsAstContinueStatement extends OvsAstBaseStatement {
    type: "ContinueStatement";
    label?: OvsAstIdentifier | null | undefined;
}

export interface OvsAstWithStatement extends OvsAstBaseStatement {
    type: "WithStatement";
    object: OvsAstExpression;
    body: OvsAstStatement;
}

export interface OvsAstSwitchStatement extends OvsAstBaseStatement {
    type: "SwitchStatement";
    discriminant: OvsAstExpression;
    cases: OvsAstSwitchCase[];
}

export interface OvsAstReturnStatement extends OvsAstBaseStatement {
    type: "ReturnStatement";
    argument?: OvsAstExpression | null | undefined;
}

export interface OvsAstThrowStatement extends OvsAstBaseStatement {
    type: "ThrowStatement";
    argument: OvsAstExpression;
}

export interface OvsAstTryStatement extends OvsAstBaseStatement {
    type: "TryStatement";
    block: OvsAstBlockStatement;
    handler?: OvsAstCatchClause | null | undefined;
    finalizer?: OvsAstBlockStatement | null | undefined;
}

export interface OvsAstWhileStatement extends OvsAstBaseStatement {
    type: "WhileStatement";
    test: OvsAstExpression;
    body: OvsAstStatement;
}

export interface OvsAstDoWhileStatement extends OvsAstBaseStatement {
    type: "DoWhileStatement";
    body: OvsAstStatement;
    test: OvsAstExpression;
}

export interface OvsAstForStatement extends OvsAstBaseStatement {
    type: "ForStatement";
    init?: OvsAstVariableDeclaration | OvsAstExpression | null | undefined;
    test?: OvsAstExpression | null | undefined;
    update?: OvsAstExpression | null | undefined;
    body: OvsAstStatement;
}

export interface OvsAstBaseForXStatement extends OvsAstBaseStatement {
    left: OvsAstVariableDeclaration | OvsAstPattern;
    right: OvsAstExpression;
    body: OvsAstStatement;
}

export interface OvsAstForInStatement extends OvsAstBaseForXStatement {
    type: "ForInStatement";
}

export interface OvsAstDebuggerStatement extends OvsAstBaseStatement {
    type: "DebuggerStatement";
}

export type OvsAstDeclaration = OvsAstFunctionDeclaration | OvsAstVariableDeclaration | OvsAstClassDeclaration;

export interface OvsAstBaseDeclaration extends OvsAstBaseStatement {
}

export interface OvsAstMaybeNamedFunctionDeclaration extends OvsAstBaseFunction, OvsAstBaseDeclaration {
    type: "FunctionDeclaration";
    /** It is null when a function declaration is a part of the `export default function` statement */
    id: OvsAstIdentifier | null;
    body: OvsAstBlockStatement;
}

export interface OvsAstFunctionDeclaration extends OvsAstMaybeNamedFunctionDeclaration {
    id: OvsAstIdentifier;
}

export interface OvsAstVariableDeclaration extends OvsAstBaseDeclaration {
    type: "VariableDeclaration";
    declarations: OvsAstVariableDeclarator[];
    kind: OvsAstSubhutiTokenAst;
}

export interface OvsAstVariableDeclarator extends OvsAstBaseNode {
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

export interface OvsAstBaseExpression extends OvsAstBaseNode {
}

export type OvsAstChainElement = OvsAstSimpleCallExpression | OvsAstMemberExpression;

export interface OvsAstChainExpression extends OvsAstBaseExpression {
    type: "ChainExpression";
    expression: OvsAstChainElement;
}

export interface OvsAstThisExpression extends OvsAstBaseExpression {
    type: "ThisExpression";
}

export interface OvsAstArrayExpression extends OvsAstBaseExpression {
    type: "ArrayExpression";
    elements: Array<OvsAstExpression | OvsAstSpreadElement | null>;
}

export interface OvsAstObjectExpression extends OvsAstBaseExpression {
    type: "ObjectExpression";
    properties: Array<OvsAstProperty | OvsAstSpreadElement>;
}

export interface OvsAstPrivateIdentifier extends OvsAstBaseNode {
    type: "PrivateIdentifier";
    name: string;
}

export interface OvsAstProperty extends OvsAstBaseNode {
    type: "Property";
    key: OvsAstExpression | OvsAstPrivateIdentifier;
    value: OvsAstExpression | OvsAstPattern; // Could be an AssignmentProperty
    kind: "init" | "get" | "set";
    method: boolean;
    shorthand: boolean;
    computed: boolean;
}

export interface OvsAstPropertyDefinition extends OvsAstBaseNode {
    type: "PropertyDefinition";
    key: OvsAstExpression | OvsAstPrivateIdentifier;
    value?: OvsAstExpression | null | undefined;
    computed: boolean;
    static: boolean;
}

export interface OvsAstFunctionExpression extends OvsAstBaseFunction, OvsAstBaseExpression {
    id?: OvsAstIdentifier | null | undefined;
    type: "FunctionExpression";
    body: OvsAstBlockStatement;
}

export interface OvsAstSequenceExpression extends OvsAstBaseExpression {
    type: "SequenceExpression";
    expressions: OvsAstExpression[];
}

export interface OvsAstUnaryExpression extends OvsAstBaseExpression {
    type: "UnaryExpression";
    operator: OvsAstUnaryOperator;
    prefix: true;
    argument: OvsAstExpression;
}

export interface OvsAstBinaryExpression extends OvsAstBaseExpression {
    type: "BinaryExpression";
    operator: OvsAstBinaryOperator;
    left: OvsAstExpression | OvsAstPrivateIdentifier;
    right: OvsAstExpression;
}

export interface OvsAstAssignmentExpression extends OvsAstBaseExpression {
    type: "AssignmentExpression";
    operator: OvsAstAssignmentOperator;
    left: OvsAstPattern | OvsAstMemberExpression;
    right: OvsAstExpression;
}

export interface OvsAstUpdateExpression extends OvsAstBaseExpression {
    type: "UpdateExpression";
    operator: OvsAstUpdateOperator;
    argument: OvsAstExpression;
    prefix: boolean;
}

export interface OvsAstLogicalExpression extends OvsAstBaseExpression {
    type: "LogicalExpression";
    operator: OvsAstLogicalOperator;
    left: OvsAstExpression;
    right: OvsAstExpression;
}

export interface OvsAstConditionalExpression extends OvsAstBaseExpression {
    type: "ConditionalExpression";
    test: OvsAstExpression;
    alternate: OvsAstExpression;
    consequent: OvsAstExpression;
}

export interface OvsAstBaseCallExpression extends OvsAstBaseExpression {
    callee: OvsAstExpression | OvsAstSuper;
    arguments: Array<OvsAstExpression | OvsAstSpreadElement>;
}

export type OvsAstCallExpression = OvsAstSimpleCallExpression | OvsAstNewExpression;

export interface OvsAstSimpleCallExpression extends OvsAstBaseCallExpression {
    type: "CallExpression";
    optional: boolean;
}

export interface OvsAstNewExpression extends OvsAstBaseCallExpression {
    type: "NewExpression";
}

export interface OvsAstMemberExpression extends OvsAstBaseExpression, OvsAstBasePattern {
    type: "MemberExpression";
    object: OvsAstExpression | OvsAstSuper;
    property: OvsAstExpression | OvsAstPrivateIdentifier;
    computed: boolean;
    optional: boolean;
}

export type OvsAstPattern = OvsAstIdentifier | OvsAstObjectPattern | OvsAstArrayPattern | OvsAstRestElement | OvsAstAssignmentPattern | OvsAstMemberExpression;

export interface OvsAstBasePattern extends OvsAstBaseNode {
}

export interface OvsAstSwitchCase extends OvsAstBaseNode {
    type: "SwitchCase";
    test?: OvsAstExpression | null | undefined;
    consequent: OvsAstStatement[];
}

export interface OvsAstCatchClause extends OvsAstBaseNode {
    type: "CatchClause";
    param: OvsAstPattern | null;
    body: OvsAstBlockStatement;
}

export interface OvsAstIdentifier extends OvsAstBaseNode, OvsAstBaseExpression, OvsAstBasePattern {
    type: "Identifier";
    name: string;
}

export type OvsAstLiteral = OvsAstSimpleLiteral | RegExpLiteral | bigintLiteral;

export interface OvsAstSimpleLiteral extends OvsAstBaseNode, OvsAstBaseExpression {
    type: "Literal";
    value: string | boolean | number | null;
    raw?: string | undefined;
}

export interface RegExpLiteral extends OvsAstBaseNode, OvsAstBaseExpression {
    type: "Literal";
    value?: RegExp | null | undefined;
    regex: {
        pattern: string;
        flags: string;
    };
    raw?: string | undefined;
}

export interface bigintLiteral extends OvsAstBaseNode, OvsAstBaseExpression {
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

export interface OvsAstForOfStatement extends OvsAstBaseForXStatement {
    type: "ForOfStatement";
    await: boolean;
}

export interface OvsAstSuper extends OvsAstBaseNode {
    type: "Super";
}

export interface OvsAstSpreadElement extends OvsAstBaseNode {
    type: "SpreadElement";
    argument: OvsAstExpression;
}

export interface OvsAstArrowFunctionExpression extends OvsAstBaseExpression, OvsAstBaseFunction {
    type: "ArrowFunctionExpression";
    expression: boolean;
    body: OvsAstBlockStatement | OvsAstExpression;
}

export interface OvsAstYieldExpression extends OvsAstBaseExpression {
    type: "YieldExpression";
    argument?: OvsAstExpression | null | undefined;
    delegate: boolean;
}

export interface OvsAstTemplateLiteral extends OvsAstBaseExpression {
    type: "TemplateLiteral";
    quasis: OvsAstTemplateElement[];
    expressions: OvsAstExpression[];
}

export interface OvsAstTaggedTemplateExpression extends OvsAstBaseExpression {
    type: "TaggedTemplateExpression";
    tag: OvsAstExpression;
    quasi: OvsAstTemplateLiteral;
}

export interface OvsAstTemplateElement extends OvsAstBaseNode {
    type: "TemplateElement";
    tail: boolean;
    value: {
        /** It is null when the template literal is tagged and the text has an invalid escape (e.g. - tag`\unicode and \u{55}`) */
        cooked?: string | null | undefined;
        raw: string;
    };
}

export interface OvsAstAssignmentProperty extends OvsAstProperty {
    value: OvsAstPattern;
    kind: "init";
    method: boolean; // false
}

export interface OvsAstObjectPattern extends OvsAstBasePattern {
    type: "ObjectPattern";
    properties: Array<OvsAstAssignmentProperty | OvsAstRestElement>;
}

export interface OvsAstArrayPattern extends OvsAstBasePattern {
    type: "ArrayPattern";
    elements: Array<OvsAstPattern | null>;
}

export interface OvsAstRestElement extends OvsAstBasePattern {
    type: "RestElement";
    argument: OvsAstPattern;
}

export interface OvsAstAssignmentPattern extends OvsAstBasePattern {
    type: "AssignmentPattern";
    left: OvsAstPattern;
    right: OvsAstExpression;
}

export type OvsAstClass = OvsAstClassDeclaration | OvsAstClassExpression;

export interface OvsAstBaseClass extends OvsAstBaseNode {
    superClass?: OvsAstExpression | null | undefined;
    body: OvsAstClassBody;
}

export interface OvsAstClassBody extends OvsAstBaseNode {
    type: "ClassBody";
    body: Array<OvsAstMethodDefinition | OvsAstPropertyDefinition | OvsAstStaticBlock>;
}

export interface OvsAstMethodDefinition extends OvsAstBaseNode {
    type: "MethodDefinition";
    key: OvsAstExpression | OvsAstPrivateIdentifier;
    value: OvsAstFunctionExpression;
    kind: "constructor" | "method" | "get" | "set";
    computed: boolean;
    static: OvsAstSubhutiTokenAst;
}

export interface OvsAstMaybeNamedClassDeclaration extends OvsAstBaseClass, OvsAstBaseDeclaration {
    type: "ClassDeclaration";
    /** It is null when a class declaration is a part of the `export default class` statement */
    id: OvsAstIdentifier | null;
}

export interface OvsAstClassDeclaration extends OvsAstMaybeNamedClassDeclaration {
    id: OvsAstIdentifier;
    class: OvsAstSubhutiTokenAst
}

export interface OvsAstClassExpression extends OvsAstBaseClass, OvsAstBaseExpression {
    type: "ClassExpression";
    id?: OvsAstIdentifier | null | undefined;
}

export interface OvsAstMetaProperty extends OvsAstBaseExpression {
    type: "MetaProperty";
    meta: OvsAstIdentifier;
    property: OvsAstIdentifier;
}

export type OvsAstModuleDeclaration =
    | OvsAstImportDeclaration
    | OvsAstExportNamedDeclaration
    | OvsAstExportDeclaration
    | OvsAstExportAllDeclaration;

export interface OvsAstBaseModuleDeclaration extends OvsAstBaseNode {
}

export type OvsAstModuleSpecifier = OvsAstImportSpecifier | OvsAstImportDefaultSpecifier | OvsAstImportNamespaceSpecifier | OvsAstExportSpecifier;

export interface OvsAstBaseModuleSpecifier extends OvsAstBaseNode {
    local: OvsAstIdentifier;
}

export interface OvsAstImportDeclaration extends OvsAstBaseModuleDeclaration {
    type: "ImportDeclaration";
    specifiers: Array<OvsAstImportSpecifier | OvsAstImportDefaultSpecifier | OvsAstImportNamespaceSpecifier>;
    source: OvsAstLiteral;
}

export interface OvsAstImportSpecifier extends OvsAstBaseModuleSpecifier {
    type: "ImportSpecifier";
    imported: OvsAstIdentifier | OvsAstLiteral;
}

export interface OvsAstImportExpression extends OvsAstBaseExpression {
    type: "ImportExpression";
    source: OvsAstExpression;
}

export interface OvsAstImportDefaultSpecifier extends OvsAstBaseModuleSpecifier {
    type: "ImportDefaultSpecifier";
}

export interface OvsAstImportNamespaceSpecifier extends OvsAstBaseModuleSpecifier {
    type: "ImportNamespaceSpecifier";
}

export interface OvsAstExportNamedDeclaration extends OvsAstBaseModuleDeclaration {
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

export interface OvsAstSubhutiTokenAst extends OvsAstBaseNodeWithoutComments {

}

export interface OvsAstExportDeclaration extends OvsAstBaseModuleDeclaration {
    type: "ExportDeclaration";
    export: OvsAstSubhutiTokenAst
    default: OvsAstSubhutiTokenAst
    declaration: OvsAstMaybeNamedFunctionDeclaration | OvsAstMaybeNamedClassDeclaration | OvsAstExpression;
}

export interface OvsAstExportAllDeclaration extends OvsAstBaseModuleDeclaration {
    type: "ExportAllDeclaration";
    exported: OvsAstIdentifier | OvsAstLiteral | null;
    source: OvsAstLiteral;
}

export interface OvsAstAwaitExpression extends OvsAstBaseExpression {
    type: "AwaitExpression";
    argument: OvsAstExpression;
}
