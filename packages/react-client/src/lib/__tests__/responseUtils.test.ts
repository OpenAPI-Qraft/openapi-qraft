import { describe, expect, it } from 'vitest';
import { resolveResponse } from '../responseUtils.js';

describe('resolveResponse', () => {
  it('should handle Error without promise', async () => {
    const testError = new Error('Test error');

    const result = await resolveResponse<unknown, Error>(testError);

    expect(result).toEqual({
      error: testError,
      response: undefined,
      data: undefined,
    });
  });

  it('should handle Response without promise', async () => {
    const mockResponse = new Response(null);

    // We use casting to bypass type checking, since we know that the function accepts Response
    // without a promise in the implementation, although types do not allow it directly.
    const result = await (resolveResponse as any)(mockResponse);

    expect(result).toEqual({
      error: expect.any(Error),
      response: mockResponse,
      data: undefined,
    });
    expect((result.error as Error).message).toBe(
      'Unhandled response without promise to resolve'
    );
  });

  it('should resolve promise with data and response', async () => {
    const mockResponse = new Response(null);
    const testData = { test: 'data' };
    const dataPromise = Promise.resolve(testData);

    const result = await resolveResponse<typeof testData, Error>(
      mockResponse,
      dataPromise
    );

    expect(result).toEqual({
      data: testData,
      response: mockResponse,
      error: undefined,
    });
  });

  it('should handle rejected promise with error and response', async () => {
    const mockResponse = new Response(null);
    const testError = new Error('Test rejection');
    const dataPromise = Promise.reject(testError);

    const result = await resolveResponse<unknown, Error>(
      mockResponse,
      dataPromise
    );

    expect(result).toEqual({
      error: testError,
      response: mockResponse,
      data: undefined,
    });
  });

  it('should handle custom error objects in rejected promise', async () => {
    const mockResponse = new Response(null);
    type CustomError = { code: string; message: string };
    const customError: CustomError = {
      code: 'CUSTOM_ERROR',
      message: 'Custom error object',
    };
    const dataPromise = Promise.reject(customError);

    const result = await resolveResponse<unknown, CustomError>(
      mockResponse,
      dataPromise
    );

    expect(result).toEqual({
      error: customError,
      response: mockResponse,
      data: undefined,
    });
  });

  it('should preserve response object when promise resolves', async () => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const mockResponse = new Response('{"key":"value"}', { headers });
    const testData = { key: 'value' };
    const dataPromise = Promise.resolve(testData);

    const result = await resolveResponse<typeof testData, Error>(
      mockResponse,
      dataPromise
    );

    expect(result.response).toBe(mockResponse);
    expect(result.data).toEqual(testData);
    expect(result.error).toBeUndefined();
  });
});
