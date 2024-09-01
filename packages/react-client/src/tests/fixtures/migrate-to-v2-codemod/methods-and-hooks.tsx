import { createAPIClient } from '../api/index.js';
import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

const oldQraft = createAPIClient({
  requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
})

oldQraft.files.getFiles.setQueryData(
  {
    header: {
      'x-monite-version': '1.0.0',
    },
    query: {
      id__in: ['1', '2'],
    },
  },
  {
    header: {
      'x-monite-version': '1.0.0',
    },
    query: {
      id__in: ['1', '2'],
    },
  },
  queryClient
);

oldQraft.files.getFiles.invalidateQueries(
  queryClient
);

oldQraft.files.getFiles.useQuery(
  {
    header: {
      'x-monite-version': '1.0.0',
    },
    query: {
      id__in: ['1', '2'],
    },
  },
  {},
  queryClient
);

oldQraft.files.getFiles.useQuery(
  {
    header: {
      'x-monite-version': '1.0.0',
    },
    query: {
      id__in: ['1', '2'],
    },
  },
  {}
);

oldQraft.files.getFiles.useIsFetching(
  {
    header: {
      'x-monite-version': '1.0.0',
    },
    query: {
      id__in: ['1', '2'],
    },
  },
  queryClient
);

oldQraft.files.getFiles.useIsFetching(
  {
    header: {
      'x-monite-version': '1.0.0',
    },
    query: {
      id__in: ['1', '2'],
    },
  }
);
