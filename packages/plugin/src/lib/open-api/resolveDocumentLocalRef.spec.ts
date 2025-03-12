import type { OpenAPI3 } from 'openapi-typescript';
import { describe, expect, it } from 'vitest';
import { resolveDocumentLocalRef } from './resolveDocumentLocalRef.js';

describe('# resolveDocumentLocalRef', () => {
  const mockOpenApiJson = {
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
    },
    paths: {},
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              format: 'int64',
            },
            name: {
              type: 'string',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            code: {
              type: 'integer',
            },
            message: {
              type: 'string',
            },
          },
        },
        'Complex/Name~With~Special/Chars': {
          type: 'string',
        },
      },
    },
  } satisfies OpenAPI3;

  describe('resolveDocumentLocalRef()', () => {
    it('should resolve a simple reference', () => {
      const result = resolveDocumentLocalRef(
        '#/components/schemas/User',
        mockOpenApiJson
      );
      expect(result).toEqual(mockOpenApiJson.components?.schemas?.User);
    });

    it('should resolve a nested reference', () => {
      const result = resolveDocumentLocalRef(
        '#/components/schemas/User/properties/id',
        mockOpenApiJson
      );
      expect(result).toEqual(
        mockOpenApiJson.components?.schemas?.User.properties.id
      );
    });

    it('should resolve a reference with special characters', () => {
      const result = resolveDocumentLocalRef(
        '#/components/schemas/Complex~1Name~0With~0Special~1Chars',
        mockOpenApiJson
      );
      expect(result).toEqual(
        mockOpenApiJson.components?.schemas['Complex/Name~With~Special/Chars']
      );
    });

    it('should throw an error for non-existent references', () => {
      expect(() =>
        resolveDocumentLocalRef(
          '#/components/schemas/NonExistent',
          mockOpenApiJson
        )
      ).toThrowError('Reference #/components/schemas/NonExistent not found');
    });

    it('should throw an error for invalid nested references', () => {
      expect(() =>
        resolveDocumentLocalRef(
          '#/components/schemas/User/nonExistentProperty',
          mockOpenApiJson
        )
      ).toThrowError(
        'Reference #/components/schemas/User/nonExistentProperty not found'
      );
    });

    it('should handle empty path segments correctly', () => {
      const result = resolveDocumentLocalRef(
        '#/components//schemas/User',
        mockOpenApiJson
      );
      expect(result).toEqual(mockOpenApiJson.components.schemas.User);
    });

    it('should handle references without a fragment', () => {
      const result = resolveDocumentLocalRef('', mockOpenApiJson);
      expect(result).toEqual(mockOpenApiJson);
    });

    it('should handle references with only a hash', () => {
      const result = resolveDocumentLocalRef('#', mockOpenApiJson);
      expect(result).toEqual(mockOpenApiJson);
    });
  });
});
