import type { components, paths } from './api/index.js';
import { requestFn } from '@openapi-qraft/react';
import * as callbacksIndex from '@openapi-qraft/react/callbacks';
import * as callbacks from '@openapi-qraft/react/callbacks/index';
import { useMutation } from '@openapi-qraft/react/callbacks/useMutation';
import { useQuery } from '@openapi-qraft/react/callbacks/useQuery';
import {
  createSecureRequestFn,
  QraftSecureRequestFn,
} from '@openapi-qraft/react/Unstable_QraftSecureRequestFn';
import { QueryClient } from '@tanstack/react-query';
import { createAPIClient as createAPIClientMjs } from './api/index.js';

console.log({} satisfies Partial<components>);
console.log({} satisfies Partial<paths>);

if (typeof createAPIClientMjs !== 'undefined') {
  console.log('Client is imported successfully from esm project.');
} else {
  console.error('Client is not imported from esm project.');
  process.exit(1);
}

if (typeof callbacks !== 'undefined') {
  console.log('Callbacks are imported successfully from esm project.');
} else {
  console.error('Callbacks are not imported from esm project.');
  process.exit(1);
}

if (typeof callbacksIndex !== 'undefined') {
  console.log('Callbacks index is imported successfully from esm project.');
} else {
  console.error('Callbacks index is not imported from esm project.');
  process.exit(1);
}

if (typeof useMutation !== 'undefined') {
  console.log('useMutation is imported successfully from esm project.');
} else {
  console.error('useMutation is not imported from esm project.');
  process.exit(1);
}

if (typeof useQuery !== 'undefined') {
  console.log('useQuery is imported successfully from esm project.');
} else {
  console.error('useQuery is not imported from esm project.');
  process.exit(1);
}

if (typeof createSecureRequestFn !== 'undefined') {
  console.log(
    'createSecureRequestFn is imported successfully from esm project.'
  );
} else {
  console.error('createSecureRequestFn is not imported from esm project.');
  process.exit(1);
}

if (typeof QraftSecureRequestFn !== 'undefined') {
  console.log(
    'QraftSecureRequestFn is imported successfully from esm project.'
  );
} else {
  console.error('QraftSecureRequestFn is not imported from esm project.');
  process.exit(1);
}

function useTsCheck() {
  const client = createAPIClientMjs({
    baseUrl: 'https://api.example.com',
    queryClient: new QueryClient(),
    requestFn,
  });

  const query = client.pet.findPetsByStatus.useSuspenseInfiniteQuery(
    {},
    {
      initialPageParam: {
        query: {
          status: 'sold',
        },
      },
      getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
        // @ts-expect-error - should not be never or any
        lastPageParam.query?.status satisfies never;
        lastPageParam.query?.status satisfies
          | undefined
          | 'sold'
          | 'available'
          | 'pending';

        return lastPageParam.query?.status === 'sold'
          ? {
              query: {
                status: 'sold',
              },
            }
          : undefined;
      },
    }
  );

  query.data.pages[0] satisfies typeof client.pet.findPetsByStatus.types.data;
  // @ts-expect-error - should not be never or any
  query.data.pages[0] satisfies never;
}
