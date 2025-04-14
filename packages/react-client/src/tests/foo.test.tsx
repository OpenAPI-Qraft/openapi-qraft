import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/query-core';
import { describe, it } from 'vitest';
import { createAPIOperationClient } from './fixtures/api/index.js';
import { files, getFileList } from './fixtures/internal-api/services/Files.js';

describe('Qraft uses singular Query', () => {
  it('supports useQuery', async () => {
    const getFileListAPI = createAPIOperationClient(getFileList, {
      queryClient: new QueryClient(),
      requestFn,
      baseUrl: 'https://api.sandbox.monite.com/v1',
    });

    getFileListAPI.setQueryData(
      {
        query: { id__in: ['1', '2'] },
        header: {
          'x-monite-version': 'asd',
        },
      },
      { data: [{ url: 'asd', file_type: 'asd', name: 'asd', id: 'asd' }] }
    );

    getFileListAPI.setQueryData(
      {
        query: { id__in: ['1', '2'] },
      } as const,
      {
        data: [
          {
            id: '1',
            name: 'Alex',
            url: 'https://example.com',
            file_type: 'pdf',
          },
        ] as const,
      }
    );
  });

  it('external mutable parameters', async () => {
    const qraft = createAPIOperationClient(files, {
      queryClient: new QueryClient(),
    });

    const parameters = {
      query: { id__in: ['1', '2'] },
    };

    const data = [
      {
        id: '1',
        name: 'Alex',
        url: 'https://example.com',
        file_type: 'pdf',
      },
    ];

    qraft.getFileList.setQueryData(parameters, { data });
    qraft.getFileList.getQueryData(parameters);
    qraft.getFileList.getQueryKey(parameters);
  });

  it('external const parameters', async () => {
    const parameters = {
      query: { id__in: ['1', '2'] },
    } as const;

    const data = [
      {
        id: '1',
        name: 'Alex',
        url: 'https://example.com',
        file_type: 'pdf',
      },
    ] as const;

    createAPIOperationClient(getFileList).getQueryKey();
    createAPIOperationClient(getFileList).getInfiniteQueryKey();
    createAPIOperationClient(files).getFileList.getInfiniteQueryKey();
    createAPIOperationClient(files).getFileList.getQueryKey();
  });
});
