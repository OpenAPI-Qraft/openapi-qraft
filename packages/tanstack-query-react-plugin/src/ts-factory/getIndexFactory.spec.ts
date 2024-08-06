import { describe, expect, test } from 'vitest';
import { maybeResolveImport } from './getIndexFactory.js';

describe('maybeResolveImport', () => {
  test('should prepend services directory to services relative path', () => {
    expect(
      maybeResolveImport({
        openapiTypesImportPath: './openapi.ts',
        servicesDirName: 'services',
      })
    ).toBe('./services/openapi.ts');
  });

  test('should remove one level from path', () => {
    expect(
      maybeResolveImport({
        openapiTypesImportPath: '../openapi.ts',
        servicesDirName: 'services',
      })
    ).toBe('./openapi.ts');
  });

  test('should not modify module path', () => {
    expect(
      maybeResolveImport({
        openapiTypesImportPath: '@my-openapi',
        servicesDirName: 'services',
      })
    ).toBe('@my-openapi');
  });

  test('should not modify absolute path', () => {
    expect(
      maybeResolveImport({
        openapiTypesImportPath: '/openapi.ts',
        servicesDirName: 'services',
      })
    ).toBe('/openapi.ts');
  });
});
