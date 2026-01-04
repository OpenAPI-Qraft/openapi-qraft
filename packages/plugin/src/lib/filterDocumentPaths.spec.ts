import type { OpenAPI3 } from 'openapi-typescript';
import { describe, expect, it } from 'vitest';
import { createServicePathMatch } from './createServicePathMatch.js';
import { filterDocumentPaths } from './filterDocumentPaths.js';

describe('filterDocumentPaths', () => {
  describe('isPathMatch', () => {
    it('should match with multiple include glob', () => {
      const isPathMatch = createServicePathMatch(['/user/**', '/post/**']);
      expect(isPathMatch('/user/1')).toBe(true);
      expect(isPathMatch('/user/1/approve')).toBe(true);
      expect(isPathMatch('/post/1')).toBe(true);
      expect(isPathMatch('/profile/1')).toBe(false);
    });

    it('should not match with inclusion pattern', () => {
      const isPathMatch = createServicePathMatch([
        '/user/**',
        '/post/**',
        '!/user/1',
      ]);
      expect(isPathMatch('/user/1')).toBe(false);
      expect(isPathMatch('/user/1/approve')).toBe(true);
      expect(isPathMatch('/post/1')).toBe(true);
      expect(isPathMatch('/profile/1')).toBe(false);
    });

    it('should not match if nothing is specified', () => {
      const isPathMatch = createServicePathMatch([]);
      expect(isPathMatch('/user/1')).toBe(false);
    });
  });

  describe('filterDocumentPaths', () => {
    const createMockSchema = (paths: Record<string, any>): OpenAPI3 => ({
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths,
      components: {},
    });

    it('should return original schema when servicesGlob is empty', () => {
      const schema = createMockSchema({
        '/user/1': { get: { responses: { 200: { description: 'OK' } } } },
        '/post/1': { get: { responses: { 200: { description: 'OK' } } } },
      });

      const result = filterDocumentPaths(schema, []);
      expect(result).toEqual(schema);
    });

    it('should include all paths matching positive patterns', () => {
      const schema = createMockSchema({
        '/user/1': { get: { responses: { 200: { description: 'OK' } } } },
        '/user/2': { get: { responses: { 200: { description: 'OK' } } } },
        '/post/1': { get: { responses: { 200: { description: 'OK' } } } },
        '/profile/1': { get: { responses: { 200: { description: 'OK' } } } },
      });

      const result = filterDocumentPaths(schema, ['/user/**', '/post/**']);
      expect(result.paths).toEqual({
        '/user/1': schema.paths?.['/user/1'],
        '/user/2': schema.paths?.['/user/2'],
        '/post/1': schema.paths?.['/post/1'],
      });
      expect(result.paths?.['/profile/1']).toBeUndefined();
    });

    it('should exclude paths matching negative patterns', () => {
      const schema = createMockSchema({
        '/user/1': { get: { responses: { 200: { description: 'OK' } } } },
        '/user/2': { get: { responses: { 200: { description: 'OK' } } } },
        '/user/internal': {
          get: { responses: { 200: { description: 'OK' } } },
        },
        '/user/internal/secret': {
          get: { responses: { 200: { description: 'OK' } } },
        },
        '/post/1': { get: { responses: { 200: { description: 'OK' } } } },
      });

      const result = filterDocumentPaths(schema, [
        '/user/**',
        '/post/**',
        '!/user/internal',
      ]);

      expect(result.paths).toEqual({
        '/user/1': schema.paths?.['/user/1'],
        '/user/2': schema.paths?.['/user/2'],
        '/user/internal/secret': schema.paths?.['/user/internal/secret'],
        '/post/1': schema.paths?.['/post/1'],
      });
      expect(result.paths?.['/user/internal']).toBeUndefined();
    });

    it('should exclude paths matching negative patterns with single positive pattern', () => {
      const schema = createMockSchema({
        '/user/1': { get: { responses: { 200: { description: 'OK' } } } },
        '/user/2': { get: { responses: { 200: { description: 'OK' } } } },
        '/user/internal': {
          get: { responses: { 200: { description: 'OK' } } },
        },
        '/user/internal/secret': {
          get: { responses: { 200: { description: 'OK' } } },
        },
        '/post/1': { get: { responses: { 200: { description: 'OK' } } } },
      });

      const result = filterDocumentPaths(schema, [
        '/user/**',
        '!/user/internal',
      ]);

      expect(result.paths).toEqual({
        '/user/1': schema.paths?.['/user/1'],
        '/user/2': schema.paths?.['/user/2'],
        '/user/internal/secret': schema.paths?.['/user/internal/secret'],
      });
      expect(result.paths?.['/user/internal']).toBeUndefined();
      expect(result.paths?.['/post/1']).toBeUndefined();
    });

    it('should handle only negative patterns (excludes everything)', () => {
      const schema = createMockSchema({
        '/user/1': { get: { responses: { 200: { description: 'OK' } } } },
        '/user/internal': {
          get: { responses: { 200: { description: 'OK' } } },
        },
        '/post/1': { get: { responses: { 200: { description: 'OK' } } } },
      });

      const result = filterDocumentPaths(schema, ['!/user/internal']);

      // When only negative patterns are provided, micromatch requires at least one positive pattern
      // So nothing should match
      expect(Object.keys(result.paths as Record<string, unknown>)).toHaveLength(
        0
      );
    });

    it('should handle nested paths with negation', () => {
      const schema = createMockSchema({
        '/user/profile': { get: { responses: { 200: { description: 'OK' } } } },
        '/user/profile/settings': {
          get: { responses: { 200: { description: 'OK' } } },
        },
        '/user/internal': {
          get: { responses: { 200: { description: 'OK' } } },
        },
        '/user/internal/admin': {
          get: { responses: { 200: { description: 'OK' } } },
        },
      });

      const result = filterDocumentPaths(schema, [
        '/user/**',
        '!/user/internal/**',
      ]);

      expect(result.paths).toEqual({
        '/user/profile': schema.paths?.['/user/profile'],
        '/user/profile/settings': schema.paths?.['/user/profile/settings'],
      });
      expect(result.paths?.['/user/internal']).toBeUndefined();
      expect(result.paths?.['/user/internal/admin']).toBeUndefined();
    });

    it('should handle multiple negative patterns', () => {
      const schema = createMockSchema({
        '/user/1': { get: { responses: { 200: { description: 'OK' } } } },
        '/user/2': { get: { responses: { 200: { description: 'OK' } } } },
        '/user/internal': {
          get: { responses: { 200: { description: 'OK' } } },
        },
        '/user/admin': { get: { responses: { 200: { description: 'OK' } } } },
        '/post/1': { get: { responses: { 200: { description: 'OK' } } } },
      });

      const result = filterDocumentPaths(schema, [
        '/user/**',
        '/post/**',
        '!/user/internal',
        '!/user/admin',
      ]);

      expect(result.paths).toEqual({
        '/user/1': schema.paths?.['/user/1'],
        '/user/2': schema.paths?.['/user/2'],
        '/post/1': schema.paths?.['/post/1'],
      });
      expect(result.paths?.['/user/internal']).toBeUndefined();
      expect(result.paths?.['/user/admin']).toBeUndefined();
    });

    it('should handle wildcard patterns with negation', () => {
      const schema = createMockSchema({
        '/api/v1/users': { get: { responses: { 200: { description: 'OK' } } } },
        '/api/v1/posts': { get: { responses: { 200: { description: 'OK' } } } },
        '/api/v1/internal': {
          get: { responses: { 200: { description: 'OK' } } },
        },
        '/api/v2/users': { get: { responses: { 200: { description: 'OK' } } } },
      });

      const result = filterDocumentPaths(schema, [
        '/api/**',
        '!/api/v1/internal',
      ]);

      expect(result.paths).toEqual({
        '/api/v1/users': schema.paths?.['/api/v1/users'],
        '/api/v1/posts': schema.paths?.['/api/v1/posts'],
        '/api/v2/users': schema.paths?.['/api/v2/users'],
      });
      expect(result.paths?.['/api/v1/internal']).toBeUndefined();
    });

    it('should preserve schema structure except paths', () => {
      const schema = createMockSchema({
        '/user/1': { get: { responses: { 200: { description: 'OK' } } } },
        '/post/1': { get: { responses: { 200: { description: 'OK' } } } },
      });

      const result = filterDocumentPaths(schema, ['/user/**']);

      expect(result.openapi).toBe(schema.openapi);
      expect(result.info).toEqual(schema.info);
      expect(result.components).toEqual(schema.components);
      expect(Object.keys(result.paths as Record<string, unknown>)).toEqual([
        '/user/1',
      ]);
    });
  });
});
