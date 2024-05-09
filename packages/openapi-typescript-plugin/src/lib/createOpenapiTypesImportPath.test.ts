import { describe, expect, it } from 'vitest';

import { createOpenapiTypesImportPath } from './createOpenapiTypesImportPath.js';

describe('createOpenapiTypesImportPath', () => {
  it('should create import path with explicit extensions from ".d.ts"', () => {
    expect(createOpenapiTypesImportPath('schema.d.ts', true)).toBe(
      '../schema.js'
    );
  });

  it('should create import path with explicit extensions from ".d.ts"', () => {
    expect(createOpenapiTypesImportPath('schema.d.ts', false)).toBe(
      '../schema.d.ts'
    );
  });

  it('should create import path without explicit extensions from ".ts"', () => {
    expect(createOpenapiTypesImportPath('schema.ts', false)).toBe(
      '../schema.ts'
    );
  });

  it('should create import path with explicit extensions from ".ts"', () => {
    expect(createOpenapiTypesImportPath('schema.ts', true)).toBe(
      '../schema.js'
    );
  });
});
