import { describe, expect, it } from 'vitest';
import { createOpenapiTypesImportPath } from './createOpenapiTypesImportPath.js';

describe('createOpenapiTypesImportPath', () => {
  it('should create import path with explicit extensions ".js" and ".d.ts"', () => {
    expect(createOpenapiTypesImportPath('schema.d.ts', '.js')).toBe(
      '../schema.d.ts'
    );
  });

  it('should create import path with explicit extensions "undefined" and ".d.ts"', () => {
    expect(createOpenapiTypesImportPath('schema.d.ts', undefined)).toBe(
      '../schema.d.ts'
    );
  });

  it('should create import path with explicit extensions "undefined" from ".ts"', () => {
    expect(createOpenapiTypesImportPath('schema.ts', undefined)).toBe(
      '../schema.ts'
    );
  });

  it('should create import path with explicit extensions ".js" from ".ts"', () => {
    expect(createOpenapiTypesImportPath('schema.ts', '.js')).toBe(
      '../schema.js'
    );
  });

  it('should create import path with explicit extensions ".ts" from ".ts"', () => {
    expect(createOpenapiTypesImportPath('schema.ts', '.ts')).toBe(
      '../schema.ts'
    );
  });
});
