import schema from '@openapi-qraft/test-fixtures/openapi.json' with { type: 'json' };
import openapiTS, { OpenAPI3 } from 'openapi-typescript';
import { describe, expect, it } from 'vitest';
import { getExportedNames } from './createExportsForComponentSchemas.js';

describe('getExportedNames(...)', () => {
  it('returns exported names without enums', async () => {
    const ast = await openapiTS(schema as OpenAPI3, {
      silent: true,
    });

    expect(getExportedNames(ast)).toEqual([
      'paths',
      'webhooks',
      'components',
      '$defs',
      'operations',
    ]);
  });

  it('returns exported names with enums', async () => {
    const ast = await openapiTS(schema as OpenAPI3, {
      silent: true,
      enum: true,
    });

    expect(getExportedNames(ast)).toEqual([
      'paths',
      'webhooks',
      'components',
      '$defs',
      'operations',
      'ApprovalPolicyStatus',
      'OrderEnum',
    ]);
  });

  it('return an empty array if no components', async () => {
    expect(
      getExportedNames(
        // @ts-expect-error - invalid AST
        [{}, []]
      )
    ).toEqual([]);
  });
});
