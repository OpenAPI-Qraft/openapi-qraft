import { requestFn } from '@openapi-qraft/react';
import {
  getInfiniteQueryKey,
  getQueryKey,
} from '@openapi-qraft/react/callbacks/index';
import { QueryClient } from '@tanstack/query-core';
import { describe, expect, it, vi } from 'vitest';
import {
  createInternalReactAPIClient as createAPIOperationClient,
  services,
} from './fixtures/files-api/index.js';
import { files, getFileList } from './fixtures/files-api/services/Files.js';

const defaultOptions = {
  queryClient: new QueryClient(),
  requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
} as const;

const mockFileData = [
  {
    id: '1',
    name: 'Alex',
    url: 'https://example.com',
    file_type: 'pdf',
  },
] as const;

describe('Create API Operation Client', () => {
  describe('Query Data Management', () => {
    it('should set query data with headers', async () => {
      const getFileListAPI = createAPIOperationClient(
        getFileList,
        defaultOptions
      );

      getFileListAPI.setQueryData(
        {
          query: { id__in: ['1', '2'] },
          header: {
            'x-monite-version': 'v2',
          },
        },
        { data: mockFileData }
      );

      getFileListAPI.setQueryData(
        {
          query: { id__in: ['1', '2'] },
        } as const,
        { data: mockFileData }
      );
    });

    it('should handle external mutable parameters', async () => {
      const qraft = createAPIOperationClient(files, {
        queryClient: new QueryClient(),
      });

      const parameters = {
        query: { id__in: ['1', '2'] },
      };

      qraft.getFileList.setQueryData(parameters, { data: mockFileData });
      expect(qraft.getFileList.getQueryData(parameters)).toMatchInlineSnapshot(`
        {
          "data": [
            {
              "file_type": "pdf",
              "id": "1",
              "name": "Alex",
              "url": "https://example.com",
            },
          ],
        }
      `);
      expect(qraft.getFileList.getQueryKey(parameters)).toMatchInlineSnapshot(`
        [
          {
            "infinite": false,
            "method": "get",
            "security": [
              "HTTPBearer",
            ],
            "url": "/files/list",
          },
          {
            "query": {
              "id__in": [
                "1",
                "2",
              ],
            },
          },
        ]
      `);
    });

    it('should handle external const parameters', async () => {
      expect(createAPIOperationClient(files).getFileList.getInfiniteQueryKey())
        .toMatchInlineSnapshot(`
        [
          {
            "infinite": true,
            "method": "get",
            "security": [
              "HTTPBearer",
            ],
            "url": "/files/list",
          },
          {},
        ]
      `);

      expect(createAPIOperationClient(getFileList).getQueryKey())
        .toMatchInlineSnapshot(`
        [
          {
            "infinite": false,
            "method": "get",
            "security": [
              "HTTPBearer",
            ],
            "url": "/files/list",
          },
          {},
        ]
      `);
    });
  });

  describe('Schema Validation', () => {
    it('should validate file list schema', () => {
      expect(createAPIOperationClient(files, defaultOptions).getFileList.schema)
        .toMatchInlineSnapshot(`
        {
          "method": "get",
          "security": [
            "HTTPBearer",
          ],
          "url": "/files/list",
        }
      `);

      expect(createAPIOperationClient(getFileList).schema)
        .toMatchInlineSnapshot(`
        {
          "method": "get",
          "security": [
            "HTTPBearer",
          ],
          "url": "/files/list",
        }
      `);
    });
  });

  describe('Query Key Generation', () => {
    it('should generate correct query keys with parameters', () => {
      expect(
        createAPIOperationClient(
          services,
          defaultOptions
        ).files.getFileList.getQueryKey({
          query: { id__in: ['1'] },
        })
      ).toMatchInlineSnapshot(`
        [
          {
            "infinite": false,
            "method": "get",
            "security": [
              "HTTPBearer",
            ],
            "url": "/files/list",
          },
          {
            "query": {
              "id__in": [
                "1",
              ],
            },
          },
        ]
      `);
    });

    it('should generate correct query keys without parameters', () => {
      expect(
        createAPIOperationClient(
          files,
          defaultOptions
        ).getFileList.getQueryKey()
      ).toMatchInlineSnapshot(`
        [
          {
            "infinite": false,
            "method": "get",
            "security": [
              "HTTPBearer",
            ],
            "url": "/files/list",
          },
          {},
        ]
      `);

      expect(
        createAPIOperationClient(getFileList, defaultOptions).getQueryKey()
      ).toMatchInlineSnapshot(`
        [
          {
            "infinite": false,
            "method": "get",
            "security": [
              "HTTPBearer",
            ],
            "url": "/files/list",
          },
          {},
        ]
      `);
    });

    it('should use custom getQueryKey function when provided', () => {
      const getQueryKeySpy = vi.fn(getQueryKey);
      expect(
        createAPIOperationClient(getFileList, defaultOptions, {
          getQueryKey: getQueryKeySpy,
        }).getQueryKey()
      ).toMatchInlineSnapshot(`
        [
          {
            "infinite": false,
            "method": "get",
            "security": [
              "HTTPBearer",
            ],
            "url": "/files/list",
          },
          {},
        ]
      `);

      expect(getQueryKeySpy).toHaveBeenCalledWith(
        defaultOptions,
        getFileList.schema,
        []
      );
    });

    it('should support infinite query keys', () => {
      expect(
        createAPIOperationClient(services, {
          getInfiniteQueryKey,
          getQueryKey,
        }).files.getFileList.getInfiniteQueryKey()
      ).toMatchInlineSnapshot(`
        [
          {
            "infinite": true,
            "method": "get",
            "security": [
              "HTTPBearer",
            ],
            "url": "/files/list",
          },
          {},
        ]
      `);

      expect(
        createAPIOperationClient(services, {
          getQueryKey,
          getInfiniteQueryKey,
        }).files.getFileList.getQueryKey()
      ).toMatchInlineSnapshot(`
        [
          {
            "infinite": false,
            "method": "get",
            "security": [
              "HTTPBearer",
            ],
            "url": "/files/list",
          },
          {},
        ]
      `);

      expect(
        createAPIOperationClient(
          services
        ).files.getFileList.getInfiniteQueryKey()
      ).toMatchInlineSnapshot(`
        [
          {
            "infinite": true,
            "method": "get",
            "security": [
              "HTTPBearer",
            ],
            "url": "/files/list",
          },
          {},
        ]
      `);

      expect(createAPIOperationClient(files).getFileList.getInfiniteQueryKey())
        .toMatchInlineSnapshot(`
        [
          {
            "infinite": true,
            "method": "get",
            "security": [
              "HTTPBearer",
            ],
            "url": "/files/list",
          },
          {},
        ]
      `);

      expect(createAPIOperationClient(getFileList).getInfiniteQueryKey())
        .toMatchInlineSnapshot(`
        [
          {
            "infinite": true,
            "method": "get",
            "security": [
              "HTTPBearer",
            ],
            "url": "/files/list",
          },
          {},
        ]
      `);

      expect(createAPIOperationClient(getFileList).getQueryKey())
        .toMatchInlineSnapshot(`
        [
          {
            "infinite": false,
            "method": "get",
            "security": [
              "HTTPBearer",
            ],
            "url": "/files/list",
          },
          {},
        ]
      `);
    });
  });
});
