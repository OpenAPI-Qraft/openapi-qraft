import type { Readable } from 'node:stream';
import type { Config } from '@redocly/openapi-core';
import type { OpenAPI3 } from 'openapi-typescript';
// @ts-expect-error - openapi-typescript does not have types for this import
import { validateAndBundle } from 'openapi-typescript/dist/lib/redoc.js';

export const readSchema = async (
  source: string | URL | OpenAPI3 | Readable | Buffer,
  redoc: Config
) => {
  const parsed = await validateAndBundle(source, {
    redoc,
    silent: false,
  });

  return parsed as OpenAPI3;
};
