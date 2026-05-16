import type { Scope } from '@babel/traverse';
import type * as t from '@babel/types';
import type {
  QraftModuleAccessOptions,
  QraftResolver,
} from '../resolvers/common.js';

export type FilterPattern = string | RegExp | Array<string | RegExp>;

export type QraftFactoryConfig = {
  name: string;
  module: string;
  context?: string;
  contextModule?: string;
};

export type QraftPrecreatedClientConfig = {
  client: string;
  clientModule: string;
  createAPIClientFn: string;
  createAPIClientFnModule: string;
  createAPIClientFnOptions: string;
  createAPIClientFnOptionsModule?: string;
};

export type DiagnosticsLevel = 'error' | 'warn' | 'off';

export type DiagnosticLayer =
  | 'gate'
  | 'entrypoint'
  | 'generated-metadata'
  | 'usage-collection';

export type DiagnosticReason = {
  layer: DiagnosticLayer;
  code: string;
  message: string;
  entrypointKey?: string;
};

export type QraftTreeShakeOptions = {
  createAPIClientFn?: QraftFactoryConfig[];
  apiClient?: QraftPrecreatedClientConfig[];
  resolve?: QraftResolver;
  moduleAccess?: QraftModuleAccessOptions;
  include?: FilterPattern;
  exclude?: FilterPattern;
  diagnostics?: DiagnosticsLevel;
  debug?: boolean;
};

export type GeneratedClientInfo = {
  importerId: string;
  clientFile: string;
  servicesDir: string;
  serviceImportPaths: Record<string, string>;
  contextImportPath: string | null;
  contextName: string | null;
};

export type OperationImportInfo = {
  importPath: string;
  operationName: string;
  localName: string;
};

export type ClientBinding = {
  name: string;
  clientSourceKey: string;
  createImportPath: string;
  hasExplicitContext: boolean;
  factory: QraftFactoryConfig;
  bindingNode: t.Node;
  declarationScope: Scope;
  localInitPath?: import('@babel/traverse').NodePath<t.VariableDeclarator>;
  mode:
    | { type: 'context' }
    | { type: 'options'; optionsExpression: t.Expression }
    | {
        type: 'precreated';
        optionsImportPath: string;
        optionsExportName: string;
      };
};

export type OperationUsage = {
  client: ClientBinding;
  serviceName: string;
  operationName: string;
  callbackName: string;
  callbackLocalName: string;
  localClientName: string;
  operationImport: OperationImportInfo;
  scopeKey: string;
};

export type InlineImportRequest = {
  createImportPath: string;
  serviceName: string;
  operationName: string;
  callbackName: string;
  callbackLocalName: string;
  operationImport: OperationImportInfo;
  kind?: 'callback' | 'schema';
};

export type SchemaUsage = {
  client: ClientBinding | null;
  sourceKey: string;
  serviceName: string;
  operationName: string;
  operationImport: OperationImportInfo;
  scopeKey: string;
};

export type GeneratedInfoRequest = {
  createImportPath: string;
  factory: QraftFactoryConfig;
};

export type CreateImportEntry = {
  sourceSpecifier: string;
  factoryFile: string;
  factory: QraftFactoryConfig;
};

export type RuntimeLocalNames = {
  api: string;
  react: string;
};

export type TransformPlan = {
  ast: t.File;
  clients: ClientBinding[];
  namedUsages: OperationUsage[];
  inlineUsages: InlineImportRequest[];
  schemaUsages: SchemaUsage[];
  generatedInfoByImport: Map<string, GeneratedClientInfo | null>;
  generatedInfoRequests: Map<string, GeneratedInfoRequest>;
  transformedReferenceKeys: Set<string>;
  localClientNamesByOperation: Map<string, string>;
  runtimeLocalNames: RuntimeLocalNames;
  createImports: Map<string, CreateImportEntry>;
  configuredFactoryNames: Set<string>;
};
