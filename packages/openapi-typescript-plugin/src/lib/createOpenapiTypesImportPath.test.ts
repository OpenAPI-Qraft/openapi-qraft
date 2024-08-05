import { describe, expect, it } from 'vitest';
import { createOpenapiTypesImportPath } from './createOpenapiTypesImportPath.js';

describe('createOpenapiTypesImportPath', () => {
  it('should create import path with explicit extensions "true" and ".d.ts"', () => {
    expect(createOpenapiTypesImportPath('schema.d.ts', true)).toBe(
      '../schema.d.ts'
    );
  });

  it('should create import path with explicit extensions "false" and ".d.ts"', () => {
    expect(createOpenapiTypesImportPath('schema.d.ts', false)).toBe(
      '../schema.d.ts'
    );
  });

  it('should create import path with explicit extensions "false" from ".ts"', () => {
    expect(createOpenapiTypesImportPath('schema.ts', false)).toBe(
      '../schema.ts'
    );
  });

  it('should create import path with explicit extensions "true" from ".ts"', () => {
    expect(createOpenapiTypesImportPath('schema.ts', true)).toBe(
      '../schema.js'
    );
  });
});
