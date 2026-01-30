import type { OpenAPI3 } from 'openapi-typescript';
import type { OpenAPISchemaType } from './OpenAPISchemaType.js';
import { unescapePointer } from '@redocly/openapi-core';

/**
 * Resolves a local reference to a value in the OpenAPI schema.
 *
 * @param ref - The reference to resolve.
 * @param openApiJson - The OpenAPI schema to resolve the reference in.
 */
export function resolveDocumentLocalRef(
  ref: string,
  openApiJson: OpenAPISchemaType | OpenAPI3
) {
  const refParts = parseLocalRef(ref);

  let result: unknown = openApiJson;
  for (const part of refParts) {
    if (result && typeof result === 'object' && part in result) {
      result = result[part as keyof typeof result];
    } else {
      throw new Error(`Reference ${ref} not found`);
    }
  }

  return result;
}

function parseLocalRef(ref: string): string[] {
  const [, pointer = ''] = ref.split('#/');

  return pointer
    .split('/')
    .map(unescapePointer)
    .filter((path) => !!path);
}
