import { http, HttpResponse } from 'msw';

import { Services, services } from './fixtures/api/index.js';

export const handlers = [
  http.get<
    ServicePathParameters<Services['counterparts']['getCounterpartsId']>,
    undefined,
    ServiceResponseParameters<Services['counterparts']['getCounterpartsId']>
  >(
    openApiToMswPath(services.counterparts.getCounterpartsId.schema.url),
    ({ params, request }) => {
      if (request.headers.get('x-monite-version') !== '1.0.0') {
        return HttpResponse.json(
          { error: { message: 'Wrong version number' } },
          { status: 500 }
        ) as never;
      }

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
    }
  ),

  http.post<
    ServicePathParameters<
      Services['counterparts']['postCounterpartsIdAddresses']
    >,
    ServiceRequestBodyParameters<
      Services['counterparts']['postCounterpartsIdAddresses']
    >,
    ServiceResponseParameters<
      Services['counterparts']['postCounterpartsIdAddresses']
    >
  >(
    openApiToMswPath(
      services.counterparts.postCounterpartsIdAddresses.schema.url
    ),
    async ({ params, request }) => {
      if (request.headers.get('x-monite-version') !== '1.0.0') {
        return HttpResponse.json(
          { error: { message: 'Wrong version number' } },
          { status: 500 }
        ) as never;
      }

      const { counterpart_id } = params;
      const body = await request.json();

      return HttpResponse.json({
        counterpart_id,
        id: 'address_id',
        is_default: false,
        ...body,
      });
    }
  ),
];

function openApiToMswPath(url: string) {
  return `*${url.replace(
    /{(.*?)}/g,
    (substring: string, group: string) => `:${group}`
  )}`;
}

type ServicePathParameters<
  T extends
    | {
        getQueryKey: (arg: never) => unknown;
      }
    | {
        getMutationKey: (arg: never) => unknown;
      },
> = T extends {
  getQueryKey: (arg: infer QueryKey) => unknown;
}
  ? QueryKey extends { path: infer Parameters }
    ? Parameters
    : T extends {
          getQueryKey: (arg: infer MutationKey) => unknown;
        }
      ? MutationKey extends { path: infer Parameters }
        ? Parameters
        : never
      : never
  : never;

type ServiceRequestBodyParameters<
  T extends {
    mutationFn: (...args: never[]) => unknown;
  },
> = T extends {
  mutationFn: (...args: never[]) => unknown;
}
  ? Parameters<T['mutationFn']>[1] extends infer Options
    ? Options extends { body: infer Body }
      ? Body
      : never
    : never
  : never;

type ServiceResponseParameters<
  T extends
    | {
        queryFn: (...args: never[]) => unknown;
      }
    | {
        mutationFn: (...args: never[]) => unknown;
      },
> = T extends {
  queryFn: (...args: never[]) => unknown;
}
  ? Awaited<ReturnType<T['queryFn']>>
  : T extends {
        mutationFn: (...args: never[]) => unknown;
      }
    ? Awaited<ReturnType<T['mutationFn']>>
    : never;
