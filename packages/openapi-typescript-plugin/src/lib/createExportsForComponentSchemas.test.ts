import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { createExportsForComponentSchemas } from './createExportsForComponentSchemas.js';

describe('createExportsForComponentSchemas', () => {
  it('should return export nodes when component schemas are found"', () => {});

  it('should return an empty array if component schemas are present but a named export collision detected', () => {});

  it('should return an empty array if no component schemas are found ', () => {
    const ast: ts.Node[] = []; // TODO: switch to an actual empty AST
    const result = createExportsForComponentSchemas(ast);
    expect(result).toEqual([]);
  });
});
