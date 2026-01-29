declare module 'openapi-typescript/dist/lib/ts.js' {
  import type ts from 'typescript';
  import type { Referenced } from '@redocly/openapi-core';

  export const JS_PROPERTY_INDEX_RE: RegExp;
  export const JS_ENUM_INVALID_CHARS_RE: RegExp;
  export const JS_PROPERTY_INDEX_INVALID_CHARS_RE: RegExp;
  export const SPECIAL_CHARACTER_MAP: Record<string, string>;
  export const BOOLEAN: ts.KeywordTypeNode<ts.SyntaxKind.BooleanKeyword>;
  export const FALSE: ts.LiteralTypeNode;
  export const NEVER: ts.KeywordTypeNode<ts.SyntaxKind.NeverKeyword>;
  export const NULL: ts.LiteralTypeNode;
  export const NUMBER: ts.KeywordTypeNode<ts.SyntaxKind.NumberKeyword>;
  export const QUESTION_TOKEN: ts.PunctuationToken<ts.SyntaxKind.QuestionToken>;
  export const STRING: ts.KeywordTypeNode<ts.SyntaxKind.StringKeyword>;
  export const TRUE: ts.LiteralTypeNode;
  export const UNDEFINED: ts.KeywordTypeNode<ts.SyntaxKind.UndefinedKeyword>;
  export const UNKNOWN: ts.KeywordTypeNode<ts.SyntaxKind.UnknownKeyword>;

  export interface AnnotatedSchemaObject {
    const?: unknown;
    default?: unknown;
    deprecated?: boolean;
    description?: string;
    enum?: unknown[];
    example?: string;
    format?: string;
    nullable?: boolean;
    summary?: string;
    title?: string;
    type?: string | string[];
  }

  export function addJSDocComment(
    schemaObject: AnnotatedSchemaObject,
    node: ts.PropertySignature
  ): void;

  interface ParameterObject {
    name: string;
    in: 'query' | 'header' | 'path' | 'cookie';
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: unknown;
    example?: unknown;
    examples?: Record<string, unknown>;
    content?: Record<string, unknown>;
  }

  type OapiRefResolved = Referenced<ParameterObject>;

  export function oapiRef(
    path: string,
    resolved?: OapiRefResolved
  ): ts.TypeNode;

  export interface AstToStringOptions {
    fileName?: string;
    sourceText?: string;
    formatOptions?: ts.PrinterOptions;
  }

  export function astToString(
    ast: ts.Node | ts.Node[] | ts.TypeElement | ts.TypeElement[],
    options?: AstToStringOptions
  ): string;

  export function stringToAST(source: string): unknown[];

  export function tsDedupe(types: ts.TypeNode[]): ts.TypeNode[];

  export const enumCache: Map<string, ts.EnumDeclaration>;

  export function tsEnum(
    name: string,
    members: (string | number)[],
    metadata?: {
      name?: string;
      description?: string;
    }[],
    options?: {
      export?: boolean;
      shouldCache?: boolean;
    }
  ): ts.EnumDeclaration;

  export function tsArrayLiteralExpression(
    name: string,
    elementType: ts.TypeNode,
    values: (string | number)[],
    options?: {
      export?: boolean;
      readonly?: boolean;
      injectFooter?: ts.Node[];
    }
  ): ts.VariableStatement;

  export function tsEnumMember(
    value: string | number,
    metadata?: {
      name?: string;
      description?: string;
    }
  ): ts.EnumMember;

  export function tsIntersection(types: ts.TypeNode[]): ts.TypeNode;

  export function tsIsPrimitive(type: ts.TypeNode): boolean;

  export function tsLiteral(value: unknown): ts.TypeNode;

  export function tsModifiers(modifiers: {
    readonly?: boolean;
    export?: boolean;
  }): ts.Modifier[];

  export function tsNullable(types: ts.TypeNode[]): ts.TypeNode;

  export function tsOmit(type: ts.TypeNode, keys: string[]): ts.TypeNode;

  export function tsRecord(
    key: ts.TypeNode,
    value: ts.TypeNode
  ): ts.TypeReferenceNode;

  export function tsPropertyIndex(
    index: string | number
  ): ts.NumericLiteral | ts.StringLiteral | ts.Identifier;

  export function tsUnion(types: ts.TypeNode[]): ts.TypeNode;

  export function tsWithRequired(
    type: ts.TypeNode,
    keys: string[],
    injectFooter: ts.Node[]
  ): ts.TypeNode;

  export function tsReadonlyArray(
    type: ts.TypeNode,
    injectFooter?: ts.Node[]
  ): ts.TypeNode;
}

declare module 'openapi-typescript/dist/lib/utils.js' {
  import type ts from 'typescript';
  import type c from 'ansi-colors';

  // eslint-disable-next-line prettier/prettier
  export { c };

  export interface DiscriminatorObject {
    propertyName: string;
    mapping?: Record<string, string>;
    oneOf?: string[];
  }

  export function createDiscriminatorProperty(
    discriminator: DiscriminatorObject,
    options: {
      path: string;
      readonly?: boolean;
    }
  ): ts.TypeElement;

  export function createRef(
    parts: (number | string | undefined | null)[]
  ): string;

  export function debug(msg: string, group?: string, time?: number): void;

  export function error(msg: string): void;

  export function formatTime(t: number): string;

  export function getEntries<T>(
    obj: ArrayLike<T> | Record<string, T>,
    options?: {
      alphabetize?: boolean;
      excludeDeprecated?: boolean;
    }
  ): [string, T][];

  export function resolveRef<T>(
    schema: unknown,
    $ref: string,
    options: {
      silent: boolean;
      visited?: string[];
    }
  ): T | undefined;

  export function scanDiscriminators(
    schema: unknown,
    options: unknown
  ): {
    objects: Record<string, DiscriminatorObject>;
    refsHandled: string[];
  };

  export function walk(
    obj: unknown,
    cb: (value: Record<string, unknown>, path: (string | number)[]) => void,
    path?: (string | number)[]
  ): void;

  export function warn(msg: string, silent?: boolean): void;
}
