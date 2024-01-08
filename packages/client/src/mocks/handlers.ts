import { http, HttpResponse } from 'msw';

import { Services } from './fixtures/api/index.js';

export const handlers = [
  http.get<
    ServicePathParameters<Services['counterparts']['getCounterpartsId']>,
    undefined,
    ServiceResponseParameters<Services['counterparts']['getCounterpartsId']>
  >('*/counterparts/:counterpart_id', ({ params }) => {
    const { counterpart_id } = params;

    return HttpResponse.json({
      id: counterpart_id,
      type: 'organization',
      created_at: '2021-08-05T13:00:00.000Z',
      updated_at: '2021-08-05T13:00:00.000Z',
      organization: {
        legal_name: 'Test Company',
        is_vendor: true,
        is_customer: false,
      },
    });
  }),
];

type ServicePathParameters<
  T extends {
    getQueryKey: (arg: never) => unknown;
  },
> = T extends {
  getQueryKey: (arg: infer QueryKey) => unknown;
}
  ? QueryKey extends { path: infer Parameters }
    ? Parameters
    : never
  : never;

type ServiceResponseParameters<
  T extends {
    queryFn: (...args: never[]) => unknown;
  },
> = T extends {
  queryFn: (...args: never[]) => unknown;
}
  ? Awaited<ReturnType<T['queryFn']>>
  : never;
