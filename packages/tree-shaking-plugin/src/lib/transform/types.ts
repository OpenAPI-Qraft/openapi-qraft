import type { Scope } from '@babel/traverse';
import type * as t from '@babel/types';
import type { QraftResolver } from '../resolvers/common.js';

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

export type QraftTreeShakeOptions = {
  createAPIClientFn?: QraftFactoryConfig[];
  apiClient?: QraftPrecreatedClientConfig[];
  resolve?: QraftResolver;
  include?: FilterPattern;
  exclude?: FilterPattern;
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
  createImportPath: string;
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
};

export type InlineImportRequest = {
  callbackName: string;
  callbackLocalName: string;
  operationImport: OperationImportInfo;
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
  generatedInfoByImport: Map<string, GeneratedClientInfo | null>;
  generatedInfoRequests: Map<string, GeneratedInfoRequest>;
  transformedReferenceKeys: Set<string>;
  localClientNamesByOperation: Map<string, string>;
  runtimeLocalNames: RuntimeLocalNames;
  createImports: Map<string, CreateImportEntry>;
  configuredFactoryNames: Set<string>;
};
