import { describe, expect, it } from 'vitest';
import { requestFnResponseRejecter } from './requestFnResponseRejecter.js';

describe('requestFnResponseRejecter', () => {
  it('should throw error if input is an Error instance', () => {
    const error = new Error('Test error');
    expect(() => requestFnResponseRejecter(error)).toThrow(error);
  });

  it('should throw error from error property if input contains error field', () => {
    const customError = new Error('Error from error property');
    const responseWithError = { error: customError };
    expect(() => requestFnResponseRejecter(responseWithError)).toThrow(
      customError
    );
  });

  it('should throw generic "Unhandled `requestFn` response" if input does not match known formats', () => {
    const unknownResponse = { data: 'some data' };
    expect(() =>
      requestFnResponseRejecter(
        // @ts-expect-error - invalid test case
        unknownResponse
      )
    ).toThrow('Unhandled `requestFn` response');
  });

  it('should add source data to cause property when throwing unhandled response error', () => {
    const unknownResponse = { data: 'some data' };

    try {
      requestFnResponseRejecter(
        // @ts-expect-error - invalid test case
        unknownResponse
      );
      expect.fail('Expected an error to be thrown');
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toBe('Unhandled `requestFn` response');
        expect(error.cause).toBe(unknownResponse);
      } else {
        expect.fail('Thrown error should be an instance of Error');
      }
    }
  });
});
