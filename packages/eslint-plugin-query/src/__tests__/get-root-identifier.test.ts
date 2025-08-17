import { parse } from '@typescript-eslint/typescript-estree';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { describe, expect, test } from 'vitest';
import { getRootIdentifier } from '../utils/get-root-identifier';

describe('get-root-identifier', () => {
  test('returns Identifier for nested MemberExpression chain', () => {
    // Represents: a.b.c
    const ast = parse('a.b.c');
    const exprStmt = ast.body[0];
    const expr = (exprStmt as any).expression; // MemberExpression
    const result = getRootIdentifier(expr);
    expect(result?.type).toBe(AST_NODE_TYPES.Identifier);
    expect(result?.name).toBe('a');
  });

  test('unwraps TSNonNullExpression before MemberExpression', () => {
    // Represents: a!.b
    const ast = parse('a!.b');
    const exprStmt = ast.body[0];
    const expr = (exprStmt as any).expression; // MemberExpression(TSNonNullExpression a, b)
    const result = getRootIdentifier(expr);
    expect(result?.type).toBe(AST_NODE_TYPES.Identifier);
    expect(result?.name).toBe('a');
  });

  test('handles nested ChainExpression wrappers', () => {
    // Represents: (a?.b)?.c
    const ast = parse('(a?.b)?.c');
    const exprStmt = ast.body[0];
    const expr = (exprStmt as any).expression; // ChainExpression
    const result = getRootIdentifier(expr);
    expect(result?.type).toBe(AST_NODE_TYPES.Identifier);
    expect(result?.name).toBe('a');
  });

  test('returns undefined when root is not Identifier', () => {
    // Represents: (42).x — the left-most node is a Literal, not an Identifier
    const ast = parse('(42).x');
    const exprStmt = ast.body[0];
    const expr = (exprStmt as any).expression; // MemberExpression
    const result = getRootIdentifier(expr);
    expect(result).toBeUndefined();
  });
});
