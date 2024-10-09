import type { OpenAPI3 } from 'openapi-typescript/src/types.js';
import { OperationObject, ParameterObject } from 'openapi-typescript';
import {
  PathItemObject,
  ReferenceObject,
} from 'openapi-typescript/src/types.js';
import { createServicePathMatch } from './createServicePathMatch.js';
import { replaceRefParametersWithComponent } from './open-api/replaceRefParametersWithComponent.js';
import {
  OperationGlobMethods,
  parseOperationGlobs,
} from './parseOperationGlobs.js';
import { splitCommaSeparatedGlobs } from './splitCommaSeparatedGlobs.js';

export function predefineSchemaParameters(
  schema: OpenAPI3,
  predefinedParametersGlobs: PredefinedParametersGlob[]
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

      for (const predefinedParametersGlob of predefinedParametersGlobs) {
        if (!predefinedParametersGlob.paths.includes(path)) {
          continue;
        }

        const predefinedPathItem = predefinedSchemaPaths[path];
        if (predefinedPathItem) assertIsPathItemObject(predefinedPathItem);
        const predefinedOperation = predefinedPathItem?.[method];
        if (predefinedOperation) assertIsOperationObject(predefinedOperation);

        const operationParameters = replaceRefParametersWithComponent(
          predefinedOperation?.parameters ?? operation.parameters,
          schema.components?.parameters
        );

        const predefinedParameters = operationParameters?.map(
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
export function parseOperationPredefinedParametersOption(
  ...optionItems: string[]
): ParsedPredefinedParametersOption[] {
  const globParametersMap = new Map<string, ParsedPredefinedParametersOption>();

  for (const optionItem of optionItems) {
    const operationGlobsRaw = optionItem.slice(
      0,
      Math.max(0, optionItem.indexOf(':')) || optionItem.length // the second part after the `:` is optional for the predefined parameters option
    );
    const parameterGlobs = optionItem.slice(operationGlobsRaw.length + 1);

    const parameters: Record<'header' | 'query' | 'cookie', string[]> = {
      header: [],
      query: [],
      cookie: [],
    };

    if (parameterGlobs) {
      splitCommaSeparatedGlobs(parameterGlobs).forEach((option) => {
        const [type, key] = option.split('.').map((s) => s.trim());

        if (type !== 'header' && type !== 'query' && type !== 'cookie')
          throw new Error(
            `Invalid option type: ${type} in ${option}. Must be one of 'header', 'query', or 'cookie'`
          );

        if (!parameters[type].includes(key)) parameters[type].push(key);
      });
    }

    const { pathGlobs, methods: methodList } =
      parseOperationGlobs(operationGlobsRaw);

    const methods = methodList ? methodList.join(',') : '';

    const globKey = `${methods}${pathGlobs}`;

    if (globParametersMap.has(globKey)) {
      throw new Error(
        `Duplicate path: ${methods ? methods + ' ' : ''}${pathGlobs} in config string.`
      );
    }

    globParametersMap.set(globKey, {
      parameters: Object.entries(parameters).flatMap(([inLocation, names]) =>
        names.map((name) => ({ in: inLocation as ParameterObject['in'], name }))
      ),
      methods: methodList,
      pathGlobs,
    });
  }

  return Array.from(globParametersMap.values());
}

export function createPredefinedParametersGlobs(
  schema: OpenAPI3,
  predefinedParameters: ParsedPredefinedParametersOption[]
): Array<PredefinedParametersGlob> {
  const predefinedParametersGlobMap = new Map<
    string,
    PredefinedParametersGlob
  >();

  const servicePredefinedParametersList = predefinedParameters.map(
    ({ pathGlobs, parameters, methods }) => {
      const globs = splitCommaSeparatedGlobs(pathGlobs);
      if (!globs.length)
        throw new Error(
          `Invalid path glob: ${pathGlobs}. Must be a comma-separated list of globs.`
        );

      return {
        methods,
        pathGlobs,
        parameters,
        isPathMatch: createServicePathMatch(globs),
      };
    }
  );

  for (const path in schema.paths) {
    if (!Object.prototype.hasOwnProperty.call(schema.paths, path)) continue;
    for (const {
      methods,
      pathGlobs,
      parameters: parametersToPredefine,
      isPathMatch,
    } of servicePredefinedParametersList) {
      if (!isPathMatch(path)) continue;

      const service = schema.paths[path];

      assertIsPathItemObject(service);

      for (const _method in service) {
        const method = _method as OperationGlobMethods;
        if (!Object.prototype.hasOwnProperty.call(service, method)) continue;
        if (
          methods !== undefined &&
          !methods.includes(method as OperationGlobMethods)
        )
          continue;

        const operation = service[method];

        if (!operation) continue;

        assertIsOperationObject(operation);

        const operationParameters = replaceRefParametersWithComponent(
          // @ts-expect-error the issue with custom OpenAPISchemaType
          operation.parameters,
          schema.components?.parameters
        );

        const predefinedParametersGlobKey = createOperationGlobsKey(
          pathGlobs,
          methods
        );

        if (!predefinedParametersGlobMap.has(predefinedParametersGlobKey))
          predefinedParametersGlobMap.set(predefinedParametersGlobKey, {
            methods: [],
            paths: [],
            parameters: [],
            errors: [],
            pathGlobs,
          });

        const predefinedPathGlob = predefinedParametersGlobMap.get(
          predefinedParametersGlobKey
        );

        if (!predefinedPathGlob)
          throw new Error('predefinedPathGlob not found');

        for (const parameterSchemaToPredefine of parametersToPredefine) {
          const parameterToPredefine = findPredefinedOperationParameter(
            parameterSchemaToPredefine,
            // @ts-expect-error the issue with custom OpenAPISchemaType
            operationParameters
          );

          if (
            !predefinedPathGlob.methods?.includes(
              method as OperationGlobMethods
            )
          ) {
            predefinedPathGlob.methods.push(method);
          }

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

  predefinedParameters.forEach(({ pathGlobs, methods }) => {
    const predefinedParametersGlobKey = createOperationGlobsKey(
      pathGlobs,
      methods
    );
    if (!predefinedParametersGlobMap.has(predefinedParametersGlobKey)) {
      predefinedParametersGlobMap.set(predefinedParametersGlobKey, {
        methods: methods ?? [],
        paths: [],
        parameters: [],
        errors: [`No matching paths found for '${pathGlobs}'`],
        pathGlobs,
      });
    }
  });

  return Array.from(predefinedParametersGlobMap.values());

  function createOperationGlobsKey(
    pathGlobs: string,
    methods: OperationGlobMethods[] | undefined
  ) {
    return `${methods?.join(',')}${pathGlobs}`;
  }
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

type ParsedPredefinedParametersOption = {
  methods: OperationGlobMethods[] | undefined;
  pathGlobs: string;
  parameters: Pick<ParameterObject, 'in' | 'name'>[];
};

export type PredefinedParametersGlob = {
  methods: OperationGlobMethods[];
  paths: string[];
  parameters: Pick<ParameterObject, 'in' | 'name'>[];
  errors: string[];
  pathGlobs: string;
};
