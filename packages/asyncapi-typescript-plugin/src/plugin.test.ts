import { createRequire } from 'node:module';
import { describe, expect, it, test } from 'vitest';
import { generateSchemaTypes } from './generateSchemaTypes.js';
import { asyncapiTypesFileNameOptionParser } from './plugin.js';

describe('asyncapi-typescript types generation', () => {
  const asyncAPIDocumentFixturePath = createRequire(process.cwd()).resolve(
    '@openapi-qraft/test-fixtures/asyncapi.json'
  );

  test('no extra options', async () => {
    const result = await generateSchemaTypes(asyncAPIDocumentFixturePath, {
      silent: true,
      args: {},
    });

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/no-extra-options.ts.snapshot.ts'
    );
  });
});

describe('asyncapiTypesFileNameOptionParser', () => {
  it('should return the input value if valid', () => {
    expect(asyncapiTypesFileNameOptionParser('asyncapi.ts')).toBe(
      'asyncapi.ts'
    );
    expect(asyncapiTypesFileNameOptionParser('asyncapi.d.ts')).toBe(
      'asyncapi.d.ts'
    );
  });

  it('should throw an error if the input value is invalid', () => {
    expect(() => asyncapiTypesFileNameOptionParser('asyncapi.js')).toThrowError(
      'AsyncAPI Schema types file name must end with ".ts" or ".d.ts"'
    );
  });

  it('should throw an error if the input value includes path', () => {
    expect(() =>
      asyncapiTypesFileNameOptionParser('path/asyncapi.ts')
    ).toThrowError('AsyncAPI Schema types file name must not include path');

    expect(() =>
      asyncapiTypesFileNameOptionParser('path\\asyncapi.ts')
    ).toThrowError('AsyncAPI Schema types file name must not include path');
  });

  it('should throw an error if the input value starts with "."', () => {
    expect(() =>
      asyncapiTypesFileNameOptionParser('.asyncapi.ts')
    ).toThrowError('AsyncAPI Schema types file name must not start with "."');
  });
});
