import { OperationObject, ParameterObject } from 'openapi-typescript';
import {
  type OpenAPI3,
  PathItemObject,
  ReferenceObject,
} from 'openapi-typescript/src/types.js';

import {
  createServicePathMatch,
  parsePathGlobs,
} from './createServicePathMatch.js';

export function predefineSchemaParameters(
  schema: OpenAPI3,
  predefinedParametersGlobMap: PredefinedParametersGlobMap
): OpenAPI3 {
  const predefinedSchemaPaths: typeof schema.paths = {};

  for (const path in schema.paths) {
    if (!Object.prototype.hasOwnProperty.call(schema.paths, path)) continue;

    const service = schema.paths[path];

    assertIsPathItemObject(service);

    predefinedSchemaPaths[path] = { ...service };

    for (const _method in service) {
      const method = _method as keyof typeof service;
      if (!Object.prototype.hasOwnProperty.call(service, method)) continue;

      const operation = service[method];
      assertIsOperationObject(operation);

      for (const predefinedParametersGlob of Object.values(
        predefinedParametersGlobMap
      )) {
        if (!predefinedParametersGlob.paths.includes(path)) {
          continue;
        }

        const predefinedPathItem = predefinedSchemaPaths[path];
        if (predefinedPathItem) assertIsPathItemObject(predefinedPathItem);
        const predefinedOperation = predefinedPathItem?.[method];
        if (predefinedOperation) assertIsOperationObject(predefinedOperation);

        const operationParameters =
          predefinedOperation?.parameters ?? operation.parameters ?? [];

        assertIsParameterObjects(operationParameters);

        const predefinedParameters = operationParameters.map(
          (operationParameter) => {
            if (
              findPredefinedOperationParameter(
                operationParameter,
                predefinedParametersGlob.parameters
              )
            ) {
              return {
                ...operationParameter,
                required: false,
              };
            }

            return operationParameter;
          }
        );

        Object.assign(predefinedSchemaPaths[path], {
          [method]: {
            ...operation,
            parameters: predefinedParameters,
          },
        });
      }
    }
  }

  return {
    ...schema,
    paths: predefinedSchemaPaths,
  };
}

type PredefinedParametersOptionMap = Record<
  string,
  Pick<ParameterObject, 'in' | 'name'>[]
>;

/**
 * Parses the given configuration string into a structured format.
 *
 * @param optionItems - The configuration string to parse. Eg. `/foo,/bar/**:header.x-monite-version,query.x-api-key`.
 * @returns The parsed configuration.
 *
 * @example
 * ```ts
 * const parsedConfig = parseOperationPredefinedParametersOption("/foo,/bar/**:header.x-monite-version,query.x-api-key");
 * ```
 */
function parseOperationPredefinedParametersOption(
  ...optionItems: string[]
): PredefinedParametersOptionMap {
  const globParametersMap: PredefinedParametersOptionMap = {};

  for (const optionItem of optionItems) {
    const [pathGlob, options] = optionItem.split(':').map((s) => s.trim());
    const parameters: Record<'header' | 'query' | 'cookie', string[]> = {
      header: [],
      query: [],
      cookie: [],
    };

    if (options) {
      options
        .split(',')
        .map((option) => option.trim())
        .filter(Boolean)
        .forEach((option) => {
          const [type, key] = option.split('.').map((s) => s.trim());

          if (type !== 'header' && type !== 'query' && type !== 'cookie')
            throw new Error(
              `Invalid option type: ${type} in ${option}. Must be one of 'header', 'query', or 'cookie'`
            );

          if (!parameters[type].includes(key)) parameters[type].push(key);
        });
    }

    if (pathGlob in globParametersMap) {
      throw new Error(`Duplicate path: ${pathGlob} in config string.`);
    }

    globParametersMap[pathGlob] = Object.entries(parameters).flatMap(
      ([inLocation, names]) =>
        names.map((name) => ({ in: inLocation as ParameterObject['in'], name }))
    );
  }

  return globParametersMap;
}

type PredefinedParametersGlobMap = {
  [glob: string]: {
    paths: string[];
    parameters: ParameterObject[];
    errors: string[];
  };
};

export function createPredefinedParametersGlobMap(
  schema: OpenAPI3,
  predefinedParameters: PredefinedParametersOptionMap
): PredefinedParametersGlobMap {
  const predefinedParametersGlobMap: PredefinedParametersGlobMap = {};

  const servicePredefinedParametersList = Object.entries(
    predefinedParameters
  ).map(([pathGlobs, parameters]) => {
    const globs = parsePathGlobs(pathGlobs);
    if (!globs)
      throw new Error(
        `Invalid path glob: ${pathGlobs}. Must be a comma-separated list of globs.`
      );

    return {
      pathGlobs,
      parameters,
      isPathMatch: createServicePathMatch(globs),
    };
  });

  for (const path in schema.paths) {
    if (!Object.prototype.hasOwnProperty.call(schema.paths, path)) continue;
    for (const {
      pathGlobs,
      parameters: parametersToPredefine,
      isPathMatch,
    } of servicePredefinedParametersList) {
      if (!isPathMatch(path)) continue;

      const service = schema.paths[path];

      assertIsPathItemObject(service);

      for (const _method in service) {
        const method = _method as keyof typeof service;
        if (!Object.prototype.hasOwnProperty.call(service, method)) continue;

        const operation = service[method];
        assertIsOperationObject(operation);

        const operationParameters = operation.parameters ?? [];
        assertIsParameterObjects(operationParameters);

        if (!(pathGlobs in predefinedParametersGlobMap))
          predefinedParametersGlobMap[pathGlobs] = {
            paths: [],
            parameters: [],
            errors: [],
          };

        const predefinedPathGlob = predefinedParametersGlobMap[pathGlobs];

        for (const parameterSchemaToPredefine of parametersToPredefine) {
          const parameterToPredefine = findPredefinedOperationParameter(
            parameterSchemaToPredefine,
            operationParameters
          );

          if (!parameterToPredefine) {
            predefinedPathGlob.errors.push(
              `Missing predefined parameter '${parameterSchemaToPredefine.in}' '${parameterSchemaToPredefine.name}' in '${method} ${path}' in '${pathGlobs}'`
            );

            continue;
          }

          const existingParameterToPredefine = findPredefinedOperationParameter(
            parameterToPredefine,
            predefinedPathGlob.parameters
          );

          if (existingParameterToPredefine) {
            if (
              !shallowEqualParameterTypes(
                parameterToPredefine,
                existingParameterToPredefine
              )
            ) {
              predefinedPathGlob.errors.push(
                `Parameter '${parameterSchemaToPredefine.in}' '${parameterToPredefine.name}' in '${method} ${path}' has conflicting types with predefined parameter '${parameterToPredefine.name}' in '${pathGlobs}'`
              );
            } else {
              if (!predefinedPathGlob.paths.includes(path))
                predefinedPathGlob.paths.push(path);
            }
          } else {
            predefinedPathGlob.parameters.push(parameterToPredefine);
            if (!predefinedPathGlob.paths.includes(path))
              predefinedPathGlob.paths.push(path);
          }
        }
      }
    }
  }

  Object.entries(predefinedParameters).forEach(([pathGlobs]) => {
    if (!predefinedParametersGlobMap[pathGlobs]) {
      predefinedParametersGlobMap[pathGlobs] = {
        paths: [],
        parameters: [],
        errors: [`No matching paths found for '${pathGlobs}'`],
      };
    }
  });

  return predefinedParametersGlobMap;
}

function findPredefinedOperationParameter(
  parameterSchemaToPredefine: { in: string; name: string },
  operationParameters: Array<ParameterObject>
) {
  return operationParameters.find(
    (operationParameter) =>
      operationParameter.in === parameterSchemaToPredefine.in &&
      operationParameter.name === parameterSchemaToPredefine.name
  );
}

function shallowEqualParameterTypes(a: ParameterObject, b: ParameterObject) {
  if ('schema' in a || 'schema' in b)
    return 'schema' in a && 'schema' in b && a.schema?.type === b.schema?.type;
}

function assertIsPathItemObject(
  pathItem: PathItemObject | ReferenceObject
): asserts pathItem is PathItemObject {
  if ('$ref' in pathItem) {
    throw new Error(
      `Expected a PathItemObject, but got a ReferenceObject: ${pathItem}`
    );
  }
}

export function assertIsOperationObject(
  operationItem: OperationObject | ReferenceObject
): asserts operationItem is OperationObject {
  if ('$ref' in operationItem) {
    throw new Error(
      `Expected a OperationObject, but got a ReferenceObject: ${operationItem}`
    );
  }
}

export function assertIsParameterObjects(
  parameterObjects: Array<ParameterObject | ReferenceObject>
): asserts parameterObjects is Array<ParameterObject> {
  parameterObjects.forEach((parameterObject) => {
    if ('$ref' in parameterObject) {
      throw new Error(
        `Expected a ParameterObject, but got a ReferenceObject: ${parameterObject}`
      );
    }
  });
}

export { parseOperationPredefinedParametersOption };
