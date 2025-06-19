import { describe, expect, it } from 'vitest';
import { urlSerializer } from './requestFn.js';

describe('urlSerializer', () => {
  it('should correctly replace path parameters', () => {
    expect(
      urlSerializer(
        { url: '/users/{userId}/posts/{postId}', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: { path: { userId: '123', postId: '456' } },
        }
      )
    ).toBe('https://api.example.com/users/123/posts/456');
  });

  it('should correctly encode complex characters in path and query parameters', () => {
    const info = {
      baseUrl: 'https://api.example.com',
      parameters: {
        path: {
          query: 'hello/world:test@domain.com',
          category: 'books & magazines',
        },
        query: {
          filter: 'price:$10-$50',
          tags: ['tag/with/slash', 'tag:with:colon'],
          special: 'symbols!@#$%^&*()+={}[]|\\:";\'<>?,./~`',
        },
      },
    } as const;

    const result = urlSerializer(
      { url: '/search/{query}/category/{category}', method: 'get' },
      info
    );

    const expectedUrl = new URL(
      'https://api.example.com/search/hello%2Fworld%3Atest%40domain.com/category/books%20%26%20magazines'
    );
    expectedUrl.searchParams.set('filter', info.parameters.query.filter);
    expectedUrl.searchParams.append('tags', info.parameters.query.tags[0]);
    expectedUrl.searchParams.append('tags', info.parameters.query.tags[1]);
    expectedUrl.searchParams.set('special', info.parameters.query.special);

    expect(result).toBe(expectedUrl.toString());
  });

  it('should correctly append query parameters', () => {
    expect(
      urlSerializer(
        { url: '/users/{userId}/posts', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: {
            path: { userId: '123' },
            query: { filter: 'recent', limit: 10 },
          },
        }
      )
    ).toBe('https://api.example.com/users/123/posts?filter=recent&limit=10');
  });

  it('should return URL without query parameters if none specified in path', () => {
    expect(
      urlSerializer(
        { url: '/users/{userId}/posts', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: { path: { userId: '123', postId: '456' } },
        }
      )
    ).toBe('https://api.example.com/users/123/posts');
  });

  it('should handle missing baseUrl gracefully', () => {
    expect(
      urlSerializer(
        { url: '/users/{userId}/posts', method: 'get' },
        {
          parameters: { path: { userId: '123' } },
        }
      )
    ).toBe('/users/123/posts');
  });

  it('should encode path parameters correctly', () => {
    expect(
      urlSerializer(
        { url: '/search/{query}', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: { path: { query: 'hello world' } },
        }
      )
    ).toBe('https://api.example.com/search/hello%20world');
  });

  it('should correctly serialize query parameters with null values', () => {
    expect(
      urlSerializer(
        { url: '/users', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: { query: { name: null, age: 30 } },
        }
      )
    ).toBe('https://api.example.com/users?age=30');
  });

  it('should correctly serialize query parameters with undefined values', () => {
    expect(
      urlSerializer(
        { url: '/users', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: { query: { name: undefined, age: 30 } },
        }
      )
    ).toBe('https://api.example.com/users?age=30');
  });

  it('should correctly serialize query parameters with array values', () => {
    expect(
      urlSerializer(
        { url: '/users', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: { query: { tags: ['admin', 'user'], age: 30 } },
        }
      )
    ).toBe('https://api.example.com/users?tags=admin&tags=user&age=30');
  });

  it('should correctly serialize query parameters with some null|undefined in array values', () => {
    expect(
      urlSerializer(
        { url: '/users', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: { query: { tags: [null, undefined, 'user'], age: 30 } },
        }
      )
    ).toBe('https://api.example.com/users?tags=user&age=30');
  });

  it('should correctly serialize query parameters with an empty array', () => {
    expect(
      urlSerializer(
        { url: '/users', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: { query: { tags: [], age: 30 } },
        }
      )
    ).toBe('https://api.example.com/users?age=30');
  });

  it('should correctly serialize query parameters with an object', () => {
    expect(
      urlSerializer(
        { url: '/users', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: {
            query: {
              tags: {
                one: 'two',
              },
              age: 30,
            },
          },
        }
      )
    ).toBe('https://api.example.com/users?tags%5Bone%5D=two&age=30');
  });

  it('should correctly serialize query parameters with an empty object', () => {
    expect(
      urlSerializer(
        { url: '/users', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: {
            query: {
              tags: {},
              age: 30,
            },
          },
        }
      )
    ).toBe('https://api.example.com/users?age=30');
  });

  it('should correctly serialize query parameters with an null|undefined object fields', () => {
    expect(
      urlSerializer(
        { url: '/users', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: {
            query: {
              tags: {
                foo: null,
                bar: undefined,
              },
              age: 30,
            },
          },
        }
      )
    ).toBe('https://api.example.com/users?age=30');
  });

  it('should correctly serialize query parameters with nested objects', () => {
    expect(
      urlSerializer(
        { url: '/search', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: { query: { filter: { category: 'books', type: null } } },
        }
      )
    ).toBe('https://api.example.com/search?filter%5Bcategory%5D=books');
  });

  it('should handle null values in path parameters', () => {
    expect(
      urlSerializer(
        { url: '/users/{userId}/posts/{postId}', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: { path: { userId: null, postId: '456' } },
        }
      )
    ).toBe('https://api.example.com/users/null/posts/456');
  });

  it('should handle undefined values in path parameters', () => {
    expect(
      urlSerializer(
        { url: '/users/{userId}/posts/{postId}', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: { path: { userId: undefined, postId: '456' } },
        }
      )
    ).toBe('https://api.example.com/users/undefined/posts/456');
  });
});
