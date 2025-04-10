import type { OpenAPI3 } from 'openapi-typescript/src/types.js';
import { ParameterObject } from 'openapi-typescript';
import { ReferenceObject } from 'openapi-typescript/src/types.js';
import { resolveDocumentLocalRef } from './resolveDocumentLocalRef.js';

export function replaceRefParametersWithComponent(
  parameters: ParameterObject | ReferenceObject | undefined,
  openApiJson: OpenAPI3
) {
  if (!Array.isArray(parameters)) return undefined;

  const definedParameters = parameters
    .map((parameter) =>
      parameter.$ref
        ? resolveDocumentLocalRef(parameter.$ref, openApiJson)
        : parameter
    )
    .filter(Boolean);

  if (!definedParameters.length) return undefined;

  return definedParameters;
}
