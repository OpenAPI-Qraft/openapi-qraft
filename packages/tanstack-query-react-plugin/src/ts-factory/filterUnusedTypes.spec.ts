import ts from 'typescript';
import { describe, expect, test } from 'vitest';
import { filterUnusedTypes } from './filterUnusedTypes.js';

describe('filterUnusedTypes(...)', () => {
  const sourceFile = ts.createSourceFile(
    'test.ts',
    `
    type Foo = ExternalBar<number>; 
    type Bar = string; 
    `,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  test('return only used external types', () => {
    const typeImports = {
      'other-module': ['ExternalBar'],
      'some-module': ['Foo', 'Bar'],
    };

    expect(
      filterUnusedTypes(typeImports, Array.from(sourceFile.statements))
    ).toEqual({
      'other-module': ['ExternalBar'],
    });
  });

  test('return empty record if no types are used', () => {
    const typeImports = {
      'some-module': ['Foo', 'Bar'],
    };

    expect(
      filterUnusedTypes(typeImports, Array.from(sourceFile.statements))
    ).toEqual({});
  });
});
