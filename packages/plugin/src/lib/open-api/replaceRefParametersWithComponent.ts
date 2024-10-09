import type { OpenAPISchemaType } from './OpenAPISchemaType.js';
import { ParameterObject } from 'openapi-typescript';
import { ReferenceObject } from 'openapi-typescript/src/types.js';

export function replaceRefParametersWithComponent(
  parameters: ParameterObject | ReferenceObject | undefined,
  parametersComponents: OpenAPISchemaType['components']['parameters']
) {
  if (!Array.isArray(parameters)) return undefined;

  const definedParameters = parameters
    .map((parameter) => {
      if (parameter.$ref)
        return getParametersComponentByRef(
          parameter.$ref,
          parametersComponents
        );
      return parameter;
    })
    .filter(Boolean);

  if (!definedParameters.length) return undefined;

  return definedParameters;
}

/**
 * Get the operation from the $ref
 * @param $ref Example: `#/components/parameters/Export`
 * @param parameters
 */
function getParametersComponentByRef(
  $ref: string,
  parameters: OpenAPISchemaType['components']['parameters']
) {
  const refPath = $ref.split('/').slice(1);
  if (refPath[1] === 'parameters') {
    return parameters?.[refPath[2]];
  }
}
