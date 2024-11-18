import {
    ArrayExpression,
    ArrowFunctionExpression,
    AssignmentExpression,
    AwaitExpression,
    BigIntLiteral,
    BinaryExpression,
    BindExpression,
    BooleanLiteral,
    CallExpression,
    ClassExpression,
    ConditionalExpression,
    DecimalLiteral,
    DoExpression,
    Expression,
    FunctionExpression,
    Identifier,
    Import,
    ImportExpression,
    JSXElement,
    JSXFragment,
    LogicalExpression,
    MemberExpression,
    MetaProperty,
    ModuleExpression,
    NewExpression,
    NullLiteral,
    NumericLiteral,
    ObjectExpression,
    OptionalCallExpression,
    OptionalMemberExpression,
    ParenthesizedExpression,
    PipelineBareFunction,
    PipelinePrimaryTopicReference,
    PipelineTopicExpression,
    RecordExpression,
    RegExpLiteral,
    SequenceExpression,
    StringLiteral,
    Super,
    TaggedTemplateExpression,
    TemplateLiteral,
    ThisExpression,
    TopicReference,
    TSAsExpression,
    TSInstantiationExpression,
    TSNonNullExpression,
    TSSatisfiesExpression,
    TSTypeAssertion,
    TupleExpression,
    TypeCastExpression,
    UnaryExpression,
    UpdateExpression,
    YieldExpression,
} from '@babel/types';

// 自定义声明类型
export interface OvsAstRenderDomViewDeclaration {
    type: "OvsRenderDomViewDeclaration";
    id: Identifier;
    children: AssignmentExpression[];
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

type OvsAstExpression = OvsAstRenderDomViewDeclaration | Expression
