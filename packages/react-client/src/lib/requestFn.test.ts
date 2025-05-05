import type { OperationSchema } from '@openapi-qraft/tanstack-query-react-types';
import { describe, expect, it } from 'vitest';
import { bodySerializer } from './requestFn.js';

describe('requestFn', () => {
  describe('bodySerializer', () => {
    const createSchema = (
      method: OperationSchema['method'],
      mediaType?: string[]
    ): OperationSchema => ({
      method,
      url: '/test',
      mediaType,
    });

    it('should return undefined for GET, HEAD, and OPTIONS methods', () => {
      const methods = ['get', 'head', 'options'] as const;
      methods.forEach((method) => {
        const schema = createSchema(method);
        expect(bodySerializer(schema, { data: 'test' })).toBeUndefined();
      });
    });

    it('should return undefined for null or undefined body', () => {
      const schema = createSchema('post');
      expect(bodySerializer(schema, null)).toBeUndefined();
      expect(bodySerializer(schema, undefined)).toBeUndefined();
    });

    it('should handle string body', () => {
      const schema = createSchema('post', ['text/plain']);
      const result = bodySerializer(schema, 'test string');
      expect(result).toEqual({
        body: 'test string',
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    });

    it('should handle FormData body', () => {
      const schema = createSchema('post');
      const formData = new FormData();
      formData.append('test', 'value');

      const result = bodySerializer(schema, formData);
      expect(result).toEqual({
        body: formData,
        headers: {
          // If the serialized body is FormData, remove the 'Content-Type' header.
          // The browser will automatically set the correct `Content-Type` and boundary expression.
          'Content-Type': null,
        },
      });
    });

    it('should handle Blob body', () => {
      const schema = createSchema('post', ['application/octet-stream']);
      const blob = new Blob(['test'], { type: 'text/plain' });

      const result = bodySerializer(schema, blob);
      expect(result).toEqual({
        body: blob,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    });

    it('should handle JSON body with form-data media type', () => {
      const schema = createSchema('post', ['multipart/form-data']);
      const body = { test: 'value', file: new Blob(['test']) };

      const result = bodySerializer(schema, body)!;
      expect(result).toEqual({
        body: expect.any(FormData),
        headers: {
          'Content-Type': null,
        },
      });

      const formData = result.body as FormData;
      expect(formData.get('test')).toBe('value');
      expect(formData.get('file')).toBeInstanceOf(Blob);
    });

    it('should handle JSON body with JSON media type', () => {
      const schema = createSchema('post', ['application/json']);
      const body = { test: 'value' };

      const result = bodySerializer(schema, body);
      expect(result).toEqual({
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle complex nested objects in form-data', () => {
      const schema = createSchema('post', ['multipart/form-data']);
      const body = {
        simple: 'value',
        array: [1, 2, 3],
        nested: { key: 'value' },
        file: new Blob(['test']),
      };

      const result = bodySerializer(schema, body)!;
      expect(result).toEqual({
        body: expect.any(FormData),
        headers: {
          'Content-Type': null,
        },
      });

      const formData = result.body as FormData;

      expect(formData.get('simple')).toBe('value');
      expect(formData.getAll('array')).toEqual(['1', '2', '3']);
      expect(formData.get('nested')).toBe(JSON.stringify({ key: 'value' }));
      expect(formData.get('file')).toBeInstanceOf(Blob);
    });
  });
});
