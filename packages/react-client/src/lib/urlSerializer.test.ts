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

  it('should correctly serialize query parameters with Date objects', () => {
    expect(
      urlSerializer(
        { url: '/events', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: {
            query: {
              startDate: new Date('2023-12-25T10:30:00.000Z'),
              limit: 5,
            },
          },
        }
      )
    ).toBe(
      `https://api.example.com/events?startDate=2023-12-25T10%3A30%3A00.000Z&limit=5`
    );
  });

  it('should correctly serialize query parameters with Date objects in arrays', () => {
    expect(
      urlSerializer(
        { url: '/events', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: {
            query: {
              dates: [
                new Date('2023-01-01T00:00:00.000Z'),
                new Date('2023-12-31T23:59:59.999Z'),
              ],
              active: true,
            },
          },
        }
      )
    ).toBe(
      'https://api.example.com/events?dates=2023-01-01T00%3A00%3A00.000Z&dates=2023-12-31T23%3A59%3A59.999Z&active=true'
    );
  });

  it('should correctly serialize query parameters with Date objects in nested objects', () => {
    const startDate = new Date('2023-01-01T00:00:00.000Z');
    expect(
      urlSerializer(
        { url: '/events', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: {
            query: {
              timeRange: {
                start: startDate,
                end: null,
              },
              limit: 10,
            },
          },
        }
      )
    ).toBe(
      'https://api.example.com/events?timeRange%5Bstart%5D=2023-01-01T00%3A00%3A00.000Z&limit=10'
    );
  });

  it('should correctly serialize query parameters with boolean values', () => {
    expect(
      urlSerializer(
        { url: '/users', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: {
            query: {
              active: true,
              verified: false,
              premium: null,
              limit: 10,
            },
          },
        }
      )
    ).toBe('https://api.example.com/users?active=true&verified=false&limit=10');
  });

  it('should correctly serialize query parameters with numeric values', () => {
    expect(
      urlSerializer(
        { url: '/products', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: {
            query: {
              price: 0,
              discount: 25.5,
              quantity: -1,
              maxPrice: 1000,
            },
          },
        }
      )
    ).toBe(
      'https://api.example.com/products?price=0&discount=25.5&quantity=-1&maxPrice=1000'
    );
  });

  it('should correctly serialize query parameters with special numeric values', () => {
    expect(
      urlSerializer(
        { url: '/data', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: {
            query: {
              infinity: Infinity,
              negativeInfinity: -Infinity,
              notANumber: NaN,
              normal: 42,
            },
          },
        }
      )
    ).toBe(
      'https://api.example.com/data?infinity=Infinity&negativeInfinity=-Infinity&notANumber=NaN&normal=42'
    );
  });

  it('should correctly serialize query parameters with empty string values', () => {
    expect(
      urlSerializer(
        { url: '/search', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: {
            query: {
              query: '',
              category: 'books',
              sort: null,
            },
          },
        }
      )
    ).toBe('https://api.example.com/search?query=&category=books');
  });

  it('should correctly serialize deeply nested objects', () => {
    expect(
      urlSerializer(
        { url: '/complex', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: {
            query: {
              level1: {
                level2: {
                  level3: {
                    value: 'deep',
                    number: 42,
                  },
                  array: ['a', 'b'],
                },
              },
              simple: 'value',
            },
          },
        }
      )
    ).toBe(
      'https://api.example.com/complex?level1%5Blevel2%5D%5Blevel3%5D%5Bvalue%5D=deep&level1%5Blevel2%5D%5Blevel3%5D%5Bnumber%5D=42&level1%5Blevel2%5D%5Barray%5D=a&level1%5Blevel2%5D%5Barray%5D=b&simple=value'
    );
  });

  it('should correctly serialize mixed arrays with different types', () => {
    const testDate = new Date('2023-06-15T12:00:00.000Z');
    expect(
      urlSerializer(
        { url: '/mixed', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: {
            query: {
              mixed: ['string', 123, true, testDate, null, undefined],
              clean: 'value',
            },
          },
        }
      )
    ).toBe(
      'https://api.example.com/mixed?mixed=string&mixed=123&mixed=true&mixed=2023-06-15T12%3A00%3A00.000Z&clean=value'
    );
  });

  it('should handle objects with arrays containing objects', () => {
    expect(
      urlSerializer(
        { url: '/nested-array-objects', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: {
            query: {
              items: [
                { name: 'item1', value: 100 },
                { name: 'item2', value: null },
              ],
              total: 2,
            },
          },
        }
      )
    ).toBe(
      'https://api.example.com/nested-array-objects?items%5Bname%5D=item1&items%5Bvalue%5D=100&items%5Bname%5D=item2&total=2'
    );
  });

  it('should handle edge cases with String() conversion', () => {
    // Test to verify correct processing of different types of data
    expect(
      urlSerializer(
        { url: '/edge-cases', method: 'get' },
        {
          baseUrl: 'https://api.example.com',
          parameters: {
            query: {
              bigint: BigInt(123),
              symbol: 'symbol-as-string', // Symbol cannot be serialized directly
              func: '[Function]', // Functions should not get into query, but if they do - as a string
            },
          },
        }
      )
    ).toBe(
      'https://api.example.com/edge-cases?bigint=123&symbol=symbol-as-string&func=%5BFunction%5D'
    );
  });
});
