import { createServicePathMatch } from './createServicePathMatch.js';
import { getOperationIdName } from './open-api/getOperationName.js';
import { Service } from './open-api/getServices.js';
import {
  OperationGlobMethods,
  parseOperationGlobs,
} from './parseOperationGlobs.js';
import { splitCommaSeparatedGlobs } from './splitCommaSeparatedGlobs.js';

export const processOperationNameModifierOption = (
  modifiers: OperationNameModifier[],
  services: Service[]
) => {
  if (!modifiers.length)
    return {
      errors: [],
      services,
    };

  const operationNameModifiers = modifiers.map((modifier) => ({
    ...modifier,
    isPathMatch: createServicePathMatch(
      splitCommaSeparatedGlobs(modifier.pathGlobs)
    ),
  }));

  type ServiceName = string;
  type ReplacedOperationNameMap = string;
  type OriginalOperationName = string;

  const serviceOperationReplacements = new Map<
    ServiceName,
    Map<
      ReplacedOperationNameMap,
      Map<OriginalOperationName, OperationNameModifier[]>
    >
  >();

  for (const service of services) {
    serviceOperationReplacements.set(service.name, new Map());

    for (const operation of service.operations) {
      const operationReplacements = serviceOperationReplacements.get(
        service.name
      );

      if (!operationReplacements)
        throw new Error('operationReplacements not found');

      const operationModifiers = operationNameModifiers.filter(
        (modifier) =>
          modifier.isPathMatch(operation.path) &&
          (modifier.methods === undefined ||
            modifier.methods.includes(operation.method)) &&
          normalizeOperationNameModifierRegex(
            modifier.operationNameModifierRegex
          ).test(operation.name)
      );

      const replacedOperationName = getOperationIdName(
        operationModifiers.reduce(
          (operationName, modifier) =>
            operationName.replace(
              normalizeOperationNameModifierRegex(
                modifier.operationNameModifierRegex
              ),
              modifier.operationNameModifierReplace
            ),
          operation.name
        )
      );

      if (replacedOperationName !== operation.name) {
        if (!operationReplacements.has(replacedOperationName))
          operationReplacements.set(replacedOperationName, new Map());
        operationReplacements.get(replacedOperationName)?.set(
          operation.name,
          operationModifiers.map(
            ({ isPathMatch: _, ...operationModifiersRest }) =>
              operationModifiersRest
          )
        );
      }
    }
  }

  const replacedOperationNamesServices = services.map((service) => ({
    ...service,
    operations: service.operations.map((operation) => {
      const operationReplacements = serviceOperationReplacements.get(
        service.name
      );
      if (!operationReplacements) return operation;

      for (const [replacedName, originalMap] of operationReplacements) {
        if (originalMap.has(operation.name)) {
          return { ...operation, name: replacedName };
        }
      }

      return operation;
    }),
  }));

  const errors = Array.from(serviceOperationReplacements).flatMap(
    ([serviceName, modifiedOperations]) =>
      Array.from(modifiedOperations).flatMap(
        ([replacedOperationName, operationModifierMap]) => {
          if (operationModifierMap.size > 1) {
            return Array.from(operationModifierMap).map(
              ([originalOperationName, modifiers]) => ({
                serviceName,
                replacedOperationName,
                originalOperationName,
                modifiers,
              })
            );
          }

          const [originalOperationName, modifiers] =
            Array.from(operationModifierMap).at(0) ?? [];

          if (modifiers && modifiers.length > 1) {
            return [
              {
                serviceName,
                replacedOperationName,
                originalOperationName,
                modifiers,
              },
            ];
          }

          return [];
        }
      )
  );

  return {
    errors,
    services: replacedOperationNamesServices,
  };
};

function normalizeOperationNameModifierRegex(regex: string) {
  return new RegExp(regex, 'g');
}

export type OperationNameModifier = {
  methods: OperationGlobMethods[] | undefined;
  /**
   * Glob pattern to match service paths, eg: `/foo,/bar/**`
   */
  pathGlobs: string;
  /**
   * Regular expression to match operation names
   */
  operationNameModifierRegex: string;
  /**
   * Replacement string for matched operation names
   */
  operationNameModifierReplace: string;
};

/**
 * Parses the given options string into a structured format.
 *
 * @param optionItems - The configuration string to parse. Eg. `/foo,/bar/**:post[A-Z][A-Za-z]+sId[A-Z][A-Za-z]+ ==> createOne` or `post /** ==> createOne`
 * @returns The parsed configuration.
 *
 * @example
 * ```ts
 * const parsedConfig = parseOperationNameModifier("/foo,/bar/**:/**:post[A-Z][A-Za-z]+sId[A-Z][A-Za-z]+ ==> createOne");
 * ```
 */
export function parseOperationNameModifier(
  ...optionItems: string[]
): OperationNameModifier[] {
  const globOperationNameModifierMap: Array<OperationNameModifier> = [];

  for (const optionItem of optionItems) {
    const operationGlobsRaw = optionItem.slice(
      0,
      Math.max(0, optionItem.indexOf(':'))
    );

    if (!operationGlobsRaw.length)
      throw new Error(
        `Invalid operation name modifier: ${optionItem}. Must be in the format of 'pathGlobs:operationNameModifierRegex ==> operationNameModifierReplace'`
      );

    const modifierPattern = optionItem.slice(operationGlobsRaw.length + 1);

    const patternRegex = modifierPattern.slice(
      0,
      modifierPattern.indexOf('==>')
    );
    const patternReplace = modifierPattern.slice(
      modifierPattern.indexOf('==>') + '==>'.length + 1
    );

    const { methods, pathGlobs } = parseOperationGlobs(operationGlobsRaw);

    if (!splitCommaSeparatedGlobs(pathGlobs).length)
      throw new Error(
        `Invalid path glob: ${pathGlobs}. Must be a comma-separated list of globs.`
      );

    globOperationNameModifierMap.push({
      methods,
      pathGlobs,
      operationNameModifierRegex: patternRegex.trim(),
      operationNameModifierReplace: patternReplace.trim(),
    });
  }

  return globOperationNameModifierMap;
}
