import { describe, it, expect } from 'vitest';

import { openapiTypesFileNameOptionParser } from './plugin.js';

describe('openapiTypesFileNameOptionParser', () => {
  it('should return the input value if valid', () => {
    expect(openapiTypesFileNameOptionParser('schema.ts')).toBe('schema.ts');
    expect(openapiTypesFileNameOptionParser('schema.d.ts')).toBe('schema.d.ts');
  });

  it('should throw an error if the input value is invalid', () => {
    expect(() => openapiTypesFileNameOptionParser('schema.js')).toThrowError(
      'OpenAPI Schema types file name must end with ".ts" or ".d.ts"'
    );
  });

  it('should throw an error if the input value includes path', () => {
    expect(() =>
      openapiTypesFileNameOptionParser('path/schema.ts')
    ).toThrowError('OpenAPI Schema types file name must not include path');

    expect(() =>
      openapiTypesFileNameOptionParser('path\\schema.ts')
    ).toThrowError('OpenAPI Schema types file name must not include path');
  });

  it('should throw an error if the input value starts with "."', () => {
    expect(() => openapiTypesFileNameOptionParser('.schema.ts')).toThrowError(
      'OpenAPI Schema types file name must not start with "."'
    );
  });
});
