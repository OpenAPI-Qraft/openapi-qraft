import type { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import { createServicePathMatch } from '@openapi-qraft/plugin/lib/createServicePathMatch';
import { isReadOnlyOperation } from '@openapi-qraft/plugin/lib/isReadOnlyOperation';
import { parseOperationGlobs } from '@openapi-qraft/plugin/lib/parseOperationGlobs';
import { splitCommaSeparatedGlobs } from '@openapi-qraft/plugin/lib/splitCommaSeparatedGlobs';
import ts from 'typescript';
import { getOperationVariableNames } from './getOperationVariableNames.js';
import {
  createServicesMutationOperationNodes,
  createServicesQueryOperationNodes,
} from './serviceOperationNodes.js';

export type ParametersWrapperConfig = {
  type: string;
  import: string;
};

export type OperationParametersTypeOption = Record<
  string,
  ParametersWrapperConfig
>;

export type ResolveServiceOperationVariableNamesOptions = {
  queryableWriteOperations?: boolean;
  operationParametersTypeWrapper?: OperationParametersTypeOption;
  imperativeQuery?: boolean;
};

/**
 * Resolves safe exported variable names for every operation in a service,
 * avoiding collisions with JavaScript reserved words, service exports, schema
 * imports, and imported helper/wrapper types.
 */
export const resolveServiceOperationVariableNames = (
  service: { typeName: string; variableName: string },
  operations: ServiceOperation[],
  options: ResolveServiceOperationVariableNamesOptions = {}
): Map<string, string> => {
  const moduleTypeImports = getModuleTypeImports(operations, {
    queryableWriteOperations: Boolean(options.queryableWriteOperations),
    imperativeQuery: options.imperativeQuery,
  });
  const parameterWrapperImports = getOperationParametersWrapperImports(
    operations,
    options.operationParametersTypeWrapper
  );

  return getOperationVariableNames(
    operations.map((operation) => operation.name),
    [
      service.variableName,
      service.typeName,
      'paths',
      'QraftServiceOperationsToken',
      ...Object.values(moduleTypeImports).flat(),
      ...Object.values(parameterWrapperImports).flat(),
    ]
  );
};

/**
 * @private
 * Checks if an operation matches the operationParametersTypeWrapper patterns.
 * @param operation - The operation to check
 * @param operationParametersTypeWrapper - An object with pattern -> config mapping
 * @returns ParametersWrapperConfig if the operation should use ParametersWrapper, null otherwise
 */
export const shouldUseParametersWrapper = (
  operation: ServiceOperation,
  operationParametersTypeWrapper: OperationParametersTypeOption | undefined
): ParametersWrapperConfig | null => {
  if (!operationParametersTypeWrapper) return null;

  for (const [pattern, config] of Object.entries(
    operationParametersTypeWrapper
  )) {
    const { pathGlobs, methods } = parseOperationGlobs(pattern);

    // Check if method matches
    if (methods && !methods.includes(operation.method)) continue;

    // Check if path matches
    const pathGlobsArray = splitCommaSeparatedGlobs(pathGlobs);
    const isPathMatch = createServicePathMatch(pathGlobsArray);
    if (!isPathMatch(operation.path)) continue;

    // Operation matches this pattern
    return config;
  }

  return null;
};

/**
 * Collects custom parameter wrapper type imports referenced by the given operations.
 */
export const getOperationParametersWrapperImports = (
  operations: ServiceOperation[],
  operationParametersTypeWrapper: OperationParametersTypeOption | undefined
): Record<string, string[]> => {
  const importsMap: Record<string, string[]> = {};
  if (!operationParametersTypeWrapper) return importsMap;

  for (const operation of operations) {
    const wrapperConfig = shouldUseParametersWrapper(
      operation,
      operationParametersTypeWrapper
    );

    // Collect imports if wrapper config is provided and has import path
    if (wrapperConfig?.import) {
      importsMap[wrapperConfig.import] ??= [];
      if (!importsMap[wrapperConfig.import].includes(wrapperConfig.type)) {
        importsMap[wrapperConfig.import].push(wrapperConfig.type);
      }
    }
  }

  return importsMap;
};

const moduleTypeImportsCache = new Map<string, Record<string, string[]>>();

const cloneModuleTypeImports = (
  imports: Record<string, string[]>
): Record<string, string[]> =>
  Object.fromEntries(
    Object.entries(imports).map(([moduleName, specifiers]) => [
      moduleName,
      [...specifiers],
    ])
  );

/**
 * Returns a list of all the modules that are imported by the operations.
 * @param operations The list of service operations to analyze
 * @param options Options for controlling module imports generation.
 * @returns Record<moduleName, importSpecifierNames[]>
 */
export const getModuleTypeImports = (
  operations: ServiceOperation[],
  options: Pick<
    ResolveServiceOperationVariableNamesOptions,
    'queryableWriteOperations' | 'imperativeQuery'
  >
): Record<string, string[]> => {
  const hasReadOnlyOperations = operations.some(isReadOnlyOperation);
  const hasWriteOperations = operations.some(
    (operation) => !isReadOnlyOperation(operation)
  );
  const cacheKey = `${hasReadOnlyOperations}:${hasWriteOperations}:${Boolean(options.queryableWriteOperations)}:${Boolean(options.imperativeQuery)}`;
  const cached = moduleTypeImportsCache.get(cacheKey);

  if (cached) {
    return cloneModuleTypeImports(cached);
  }

  const nodes = [];

  if (hasReadOnlyOperations || options.queryableWriteOperations) {
    nodes.push(
      ...createServicesQueryOperationNodes({
        omitOperationQueryFnNodes: !hasReadOnlyOperations,
        imperativeQuery: options.imperativeQuery,
      })
    );
  }

  if (hasWriteOperations) {
    nodes.push(...createServicesMutationOperationNodes());
  }

  const result = nodes
    .map((node) =>
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.importClause?.isTypeOnly &&
      node.importClause.namedBindings &&
      ts.isNamedImports(node.importClause.namedBindings)
        ? {
            module: node.moduleSpecifier.text,
            imports: node.importClause.namedBindings.elements
              .filter(ts.isImportSpecifier)
              .map((specifier) => specifier.name.text),
          }
        : undefined
    )
    .reduce<Record<string, string[]>>((acc, item) => {
      if (!item) return acc;
      if (!acc[item.module])
        acc[item.module] = item.imports.filter(arrayFilterUniqueCallback);
      else
        acc[item.module] = [...acc[item.module], ...item.imports].filter(
          arrayFilterUniqueCallback
        );

      acc[item.module].sort();

      return acc;
    }, {});

  moduleTypeImportsCache.set(cacheKey, result);

  return cloneModuleTypeImports(result);
};

function arrayFilterUniqueCallback<T>(value: T, index: number, self: T[]) {
  return self.indexOf(value) === index;
}
