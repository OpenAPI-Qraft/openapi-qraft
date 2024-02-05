import { qraftAPIClient } from '@radist2s/qraft';
import { getInfiniteQueryData } from '@radist2s/qraft/callbacks/getInfiniteQueryData';
import { getInfiniteQueryKey } from '@radist2s/qraft/callbacks/getInfiniteQueryKey';
import { getMutationKey } from '@radist2s/qraft/callbacks/getMutationKey';
import { getQueryData } from '@radist2s/qraft/callbacks/getQueryData';
import { getQueryKey } from '@radist2s/qraft/callbacks/getQueryKey';
import { mutationFn } from '@radist2s/qraft/callbacks/mutationFn';
import { queryFn } from '@radist2s/qraft/callbacks/queryFn';
import { setInfiniteQueryData } from '@radist2s/qraft/callbacks/setInfiniteQueryData';
import { setQueryData } from '@radist2s/qraft/callbacks/setQueryData';
import { useInfiniteQuery } from '@radist2s/qraft/callbacks/useInfiniteQuery';
import { useMutation } from '@radist2s/qraft/callbacks/useMutation';
import { useQuery } from '@radist2s/qraft/callbacks/useQuery';

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
  const { data } = qraft.entityUsers.getEntityUsersMe.useQuery({
    header: {
      'x-monite-version': MONITE_VERSION,
    },
  });

  return <>{data?.first_name}</>;
}

export default App;
