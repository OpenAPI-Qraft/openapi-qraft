import { describe, expect, test } from 'vitest';
import { parseOptionSubValues } from './parseOptionSubValues.js';

describe('parseOptionSubValues', () => {
  test('should parse a single option with sub-values', () => {
    const result = parseOptionSubValues('services:users,profile', [
      ['my-api-client', {}],
    ]);
    expect(result).toEqual([
      ['my-api-client', { services: ['users', 'profile'] }],
    ]);
  });

  test('should parse a single option with a single sub-value', () => {
    const result = parseOptionSubValues('services:users', [
      ['my-api-client', {}],
    ]);
    expect(result).toEqual([['my-api-client', { services: ['users'] }]]);
  });

  test('should parse an option without sub-values', () => {
    const result = parseOptionSubValues('createAPIClient', undefined);
    expect(result).toEqual([['createAPIClient', {}]]);
  });

  test('should add sub-values to the last option', () => {
    let result = parseOptionSubValues('createAPIClient', undefined);
    result = parseOptionSubValues('services:users,profile', result);
    expect(result).toEqual([
      ['createAPIClient', { services: ['users', 'profile'] }],
    ]);
  });

  test('should handle multiple options with sub-values', () => {
    let result = parseOptionSubValues('createAPIClient', undefined);
    result = parseOptionSubValues('services:users,profile', result);
    result = parseOptionSubValues('callbacks:useQuery,useMutation', result);
    expect(result).toEqual([
      [
        'createAPIClient',
        {
          services: ['users', 'profile'],
          callbacks: ['useQuery', 'useMutation'],
        },
      ],
    ]);
  });

  test('should create a new entry when adding a new option without colon', () => {
    let result = parseOptionSubValues('createAPIClient', undefined);
    result = parseOptionSubValues('services:users,profile', result);
    result = parseOptionSubValues(
      'callbacks:setQueryData,getQueryData',
      result
    );
    result = parseOptionSubValues('anotherClient', result);
    result = parseOptionSubValues('services:users,profile', result);
    expect(result).toEqual([
      [
        'createAPIClient',
        {
          services: ['users', 'profile'],
          callbacks: ['setQueryData', 'getQueryData'],
        },
      ],
      [
        'anotherClient',
        {
          services: ['users', 'profile'],
        },
      ],
    ]);
  });

  test('should handle empty sub-values', () => {
    const result = parseOptionSubValues('foobar:', [['api-services', {}]]);
    expect(result).toEqual([['api-services', { foobar: [] }]]);
  });

  test('should trim and filter empty sub-values', () => {
    const result = parseOptionSubValues('services:users, , profile', [
      ['api-services', {}],
    ]);
    expect(result).toEqual([
      ['api-services', { services: ['users', 'profile'] }],
    ]);
  });
});
