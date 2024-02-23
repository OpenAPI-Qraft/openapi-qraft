import { qraftAPIClient } from '@openapi-qraft/react';
import { getInfiniteQueryData } from '@openapi-qraft/react/callbacks/getInfiniteQueryData';
import { getInfiniteQueryKey } from '@openapi-qraft/react/callbacks/getInfiniteQueryKey';
import { getMutationKey } from '@openapi-qraft/react/callbacks/getMutationKey';
import { getQueryData } from '@openapi-qraft/react/callbacks/getQueryData';
import { getQueryKey } from '@openapi-qraft/react/callbacks/getQueryKey';
import { mutationFn } from '@openapi-qraft/react/callbacks/mutationFn';
import { queryFn } from '@openapi-qraft/react/callbacks/queryFn';
import { setInfiniteQueryData } from '@openapi-qraft/react/callbacks/setInfiniteQueryData';
import { setQueryData } from '@openapi-qraft/react/callbacks/setQueryData';
import { useInfiniteQuery } from '@openapi-qraft/react/callbacks/useInfiniteQuery';
import { useMutation } from '@openapi-qraft/react/callbacks/useMutation';
import { useQuery } from '@openapi-qraft/react/callbacks/useQuery';
import { useQueryClient } from '@tanstack/react-query';

import { Services, services } from './api';
import { MONITE_VERSION } from './constants.ts';

const callbacks = {
  getInfiniteQueryData,
  getInfiniteQueryKey,
  getMutationKey,
  getQueryData,
  getQueryKey,
  mutationFn,
  queryFn,
  setInfiniteQueryData,
  setQueryData,
  useInfiniteQuery,
  useMutation,
  useQuery,
} as const;

const qraft = qraftAPIClient<Services, typeof callbacks>(services, callbacks);

function App() {
  const queryClient = useQueryClient();

  qraft.entityUsers.getEntityUsersMe.getQueryData(
    {
      header: {
        'x-monite-version': MONITE_VERSION,
      },
    } as const,
    queryClient
  );

  const { data } = qraft.entityUsers.getEntityUsersMe.useQuery({
    header: {
      'x-monite-version': MONITE_VERSION,
    },
  });

  return <>{data?.first_name}</>;
}

export default App;
