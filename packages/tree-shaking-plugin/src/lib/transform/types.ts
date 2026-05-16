import type { Scope } from '@babel/traverse';
import type * as t from '@babel/types';
import type {
  QraftModuleAccessOptions,
  QraftResolver,
} from '../resolvers/common.js';

export type FilterPattern = string | RegExp | Array<string | RegExp>;

export type ModuleExportTarget = {
  exportName: string;
  moduleSpecifier: string;
};

export type ReactContextTarget = {
  exportName: string;
  moduleSpecifier?: string;
};

export type QraftClientFactoryEntrypointConfig = {
  kind: 'clientFactory';
  factory: ModuleExportTarget;
  reactContext?: ReactContextTarget;
};

export type QraftPrecreatedClientEntrypointConfig = {
  kind: 'precreatedClient';
  client: ModuleExportTarget;
  factory: ModuleExportTarget;
  optionsFactory: ModuleExportTarget;
};

export type QraftEntrypointConfig =
  | QraftClientFactoryEntrypointConfig
  | QraftPrecreatedClientEntrypointConfig;

export type LegacyQraftFactoryConfig = {
  name: string;
  module: string;
  context?: string;
  contextModule?: string;
};

export type LegacyQraftPrecreatedClientConfig = {
  client: string;
  clientModule: string;
  createAPIClientFn: string;
  createAPIClientFnModule: string;
  createAPIClientFnOptions: string;
  createAPIClientFnOptionsModule?: string;
};

export type DiagnosticsLevel = 'error' | 'warn' | 'off';

export type ImportTarget = {
  exportName: string;
  moduleSpecifier: string;
};

export type ReactContextConfig = {
  exportName: string;
  moduleSpecifier: string | null;
};

export type GeneratedFactoryEntrypoint = {
  kind: 'generatedFactory';
  key: string;
  factory: ImportTarget;
  reactContext: ReactContextConfig | null;
};

export type PrecreatedClientEntrypoint = {
  kind: 'precreatedClient';
  key: string;
  client: ImportTarget;
  factory: ImportTarget;
  optionsFactory: ImportTarget;
};

export type ClientEntrypoint =
  | GeneratedFactoryEntrypoint
  | PrecreatedClientEntrypoint;

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
  entrypoints?: QraftEntrypointConfig[];
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

export type GeneratedClientMetadata = {
  entrypoint: ClientEntrypoint;
  factoryFile: string;
  servicesDir: string;
  serviceImportPaths: Record<string, string>;
  reactContext: ReactContextConfig | null;
  optionsFactory?: ImportTarget;
};

export type GeneratedMetadataResult = {
  metadataByEntrypointKey: Map<string, GeneratedClientMetadata | null>;
  reasons: DiagnosticReason[];
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
  factory: LegacyQraftFactoryConfig;
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
  factory: LegacyQraftFactoryConfig;
};

export type CreateImportEntry = {
  sourceSpecifier: string;
  factoryFile: string;
  factory: LegacyQraftFactoryConfig;
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
