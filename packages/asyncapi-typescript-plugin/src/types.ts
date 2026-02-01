import type { AsyncAPIDocumentInterface } from '@qraft/asyncapi-plugin';
import type ts from 'typescript';

export interface AsyncAPITSOptions {
  /** Alphabetize all keys? (default: false) */
  alphabetize?: boolean;
  /** Should schema objects with a default value not be considered optional? */
  defaultNonNullable?: boolean;
  /** Allow schema objects with no specified properties to have additional properties if not expressly forbidden? (default: false) */
  emptyObjectsUnknown?: boolean;
  /** Export true TypeScript enums instead of unions */
  enum?: boolean;
  /** Export union values as arrays */
  enumValues?: boolean;
  /** Dedupe enum values */
  dedupeEnums?: boolean;
  /** Export type instead of interface */
  exportType?: boolean;
  /** Add readonly properties and readonly arrays? (default: false) */
  immutable?: boolean;
  /** Should logging be suppressed? (necessary for STDOUT) */
  silent?: boolean;
  /** Manually transform certain Schema Objects with a custom TypeScript type */
  transform?: (
    schemaObject: SchemaObject,
    options: TransformNodeOptions
  ) => ts.TypeNode | TransformObject | undefined;
  /** Modify TypeScript types built from Schema Objects */
  postTransform?: (
    type: ts.TypeNode,
    options: TransformNodeOptions
  ) => ts.TypeNode | undefined;
  /** Treat all objects as if they have `additionalProperties: true` by default (default: false) */
  additionalProperties?: boolean;
  /** Exclude deprecated fields from types? (default: false) */
  excludeDeprecated?: boolean;
  /** Treat all objects as if they have `required` set to all properties by default (default: false) */
  propertiesRequiredByDefault?: boolean;
}

export interface TransformObject {
  schema: ts.TypeNode;
  questionToken: boolean;
}

export interface SchemaObject {
  type?: string | string[];
  properties?: Record<string, SchemaObject | ReferenceObject>;
  additionalProperties?: boolean | SchemaObject | ReferenceObject;
  required?: string[];
  items?: SchemaObject | ReferenceObject;
  allOf?: (SchemaObject | ReferenceObject)[];
  anyOf?: (SchemaObject | ReferenceObject)[];
  oneOf?: (SchemaObject | ReferenceObject)[];
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  nullable?: boolean;
  format?: string;
  description?: string;
  title?: string;
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  prefixItems?: (SchemaObject | ReferenceObject)[];
  $defs?: Record<string, SchemaObject>;
  'x-enum-varnames'?: string[];
  'x-enumNames'?: string[];
  'x-enum-descriptions'?: string[];
  'x-enumDescriptions'?: string[];
  [key: `x-${string}`]: unknown;
}

export interface ReferenceObject {
  $ref: string;
}

export interface TransformNodeOptions {
  path?: string;
  schema?: SchemaObject | ReferenceObject;
  ctx: AsyncAPIContext;
}

export interface AsyncAPIContext {
  alphabetize: boolean;
  additionalProperties: boolean;
  defaultNonNullable: boolean;
  emptyObjectsUnknown: boolean;
  enum: boolean;
  enumValues: boolean;
  dedupeEnums: boolean;
  excludeDeprecated: boolean;
  exportType: boolean;
  immutable: boolean;
  propertiesRequiredByDefault: boolean;
  silent: boolean;
  transform: AsyncAPITSOptions['transform'];
  postTransform: AsyncAPITSOptions['postTransform'];
  injectFooter: ts.Node[];
  resolve<T>(ref: string): T | undefined;
  document: AsyncAPIDocumentInterface;
  rawSchema: Record<string, unknown>;
}

export interface AsyncAPIChannelObject {
  address?: string;
  messages?: Record<string, AsyncAPIMessageObject | ReferenceObject>;
  parameters?: Record<string, AsyncAPIParameterObject | ReferenceObject>;
  description?: string;
  servers?: ReferenceObject[];
  bindings?: Record<string, unknown>;
  [key: `x-${string}`]: unknown;
}

export interface AsyncAPIReplyAddressObject {
  location: string;
  description?: string;
  [key: `x-${string}`]: unknown;
}

export interface AsyncAPICorrelationIdObject {
  location: string;
  description?: string;
  [key: `x-${string}`]: unknown;
}

export interface AsyncAPIOperationReplyObject {
  channel?: ReferenceObject;
  messages?: (ReferenceObject | AsyncAPIMessageObject)[];
  address?: AsyncAPIReplyAddressObject | ReferenceObject;
}

export interface AsyncAPIOperationObject {
  action: 'send' | 'receive';
  channel?: ReferenceObject;
  messages?: (ReferenceObject | AsyncAPIMessageObject)[];
  reply?: AsyncAPIOperationReplyObject;
  summary?: string;
  description?: string;
  traits?: ReferenceObject[];
  bindings?: Record<string, unknown>;
  [key: `x-${string}`]: unknown;
}

export interface AsyncAPIMessageObject {
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  contentType?: string;
  payload?: SchemaObject | ReferenceObject;
  headers?: SchemaObject | ReferenceObject;
  correlationId?: AsyncAPICorrelationIdObject | ReferenceObject;
  traits?: ReferenceObject[];
  bindings?: Record<string, unknown>;
  [key: `x-${string}`]: unknown;
}

export interface AsyncAPIParameterObject {
  description?: string;
  schema?: SchemaObject | ReferenceObject;
  location?: string;
  [key: `x-${string}`]: unknown;
}

export interface AsyncAPIMessageTraitObject {
  headers?: SchemaObject | ReferenceObject;
  contentType?: string;
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  correlationId?: AsyncAPICorrelationIdObject | ReferenceObject;
  bindings?: Record<string, unknown>;
  [key: `x-${string}`]: unknown;
}

export interface AsyncAPIServerObject {
  host?: string;
  protocol?: string;
  protocolVersion?: string;
  pathname?: string;
  description?: string;
  variables?: Record<string, unknown>;
  security?: unknown[];
  tags?: Array<{ name: string; description?: string }>;
  bindings?: Record<string, unknown>;
  [key: `x-${string}`]: unknown;
}

export interface AsyncAPIComponentsObject {
  schemas?: Record<string, SchemaObject>;
  messages?: Record<string, AsyncAPIMessageObject>;
  parameters?: Record<string, AsyncAPIParameterObject>;
  securitySchemes?: Record<string, unknown>;
  servers?: Record<string, AsyncAPIServerObject | ReferenceObject>;
  channels?: Record<string, AsyncAPIChannelObject>;
  operations?: Record<string, AsyncAPIOperationObject>;
  messageTraits?: Record<string, AsyncAPIMessageTraitObject>;
  operationTraits?: Record<string, unknown>;
  replyAddresses?: Record<string, AsyncAPIReplyAddressObject>;
  correlationIds?: Record<string, AsyncAPICorrelationIdObject>;
  [key: `x-${string}`]: unknown;
}
