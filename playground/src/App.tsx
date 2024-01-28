import { createQueryCraft } from '@radist2s/qraft/createQueryCraft';
import { getMutationKey } from '@radist2s/qraft/lib/callbacks/getMutationKey';
import { getQueryKey } from '@radist2s/qraft/lib/callbacks/getQueryKey';
import { mutationFn } from '@radist2s/qraft/lib/callbacks/mutationFn';
import { queryFn } from '@radist2s/qraft/lib/callbacks/queryFn';
import { useInfiniteQuery } from '@radist2s/qraft/lib/callbacks/useInfiniteQuery';
import { useMutation } from '@radist2s/qraft/lib/callbacks/useMutation';
import { useQuery } from '@radist2s/qraft/lib/callbacks/useQuery';

import { Services, services } from './api';
import { MONITE_VERSION } from './constants.ts';

const callbacks = {
  queryFn,
  useQuery,
  useInfiniteQuery,
  getQueryKey,
  mutationFn,
  useMutation,
  getMutationKey,
} as const;

const qraft = createQueryCraft<Services, typeof callbacks>(services, callbacks);

function App() {
  const { data } = qraft.entityUsers.getEntityUsersMe.useQuery({
    header: {
      'x-monite-version': MONITE_VERSION,
    },
  });

  return <>{data?.first_name}</>;
}

export default App;
