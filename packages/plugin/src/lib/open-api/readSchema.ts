import { createConfig } from '@redocly/openapi-core';

import type { Readable } from 'node:stream';
import type { OpenAPI3 } from 'openapi-typescript';
import { validateAndBundle } from 'openapi-typescript/dist/lib/redoc.js';

export const readSchema = async (
  source: string | URL | OpenAPI3 | Readable | Buffer
) => {
  const redoc = await createConfig(
    {
      rules: {
        'operation-operationId-unique': { severity: 'error' }, // throw error on duplicate operationIDs
      },
    },
    { extends: ['minimal'] }
  );

  const parsed = await validateAndBundle(source, {
    redoc,
    silent: false,
  });

  return parsed as OpenAPI3;
};
