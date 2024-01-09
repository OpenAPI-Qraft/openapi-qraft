import { http, HttpResponse } from 'msw';
import queryString from 'query-string';

import { Services, services } from './fixtures/api/index.js';

export const handlers = [
  http.get<
    ServicePathParameters<
      Services['approvalPolicies']['getApprovalPoliciesId']
    >,
    undefined,
    ServiceResponseParameters<
      Services['approvalPolicies']['getApprovalPoliciesId']
    >
  >(
    openApiToMswPath(
      services.approvalPolicies.getApprovalPoliciesId.schema.url
    ),
    ({ params: { '0': _, ...path }, request }) => {
      const query = getQueryParameters<
        Services['approvalPolicies']['getApprovalPoliciesId']
      >(request.url);

      const header = getHeaders<
        Services['approvalPolicies']['getApprovalPoliciesId']
      >(request.headers, 'x-');

      return HttpResponse.json({
        path,
        query,
        header,
      });
    }
  ),

  http.post<
    ServicePathParameters<Services['entities']['postEntitiesIdDocuments']>,
    ServiceRequestBodyParameters<
      Services['entities']['postEntitiesIdDocuments']
    >,
    ServiceResponseParameters<Services['entities']['postEntitiesIdDocuments']>
  >(
    openApiToMswPath(services.entities.postEntitiesIdDocuments.schema.url),
    async ({ params: { '0': _, ...path }, request }) => {
      const query = getQueryParameters<
        Services['entities']['postEntitiesIdDocuments']
      >(request.url);

      const header = getHeaders<
        Services['entities']['postEntitiesIdDocuments']
      >(request.headers, 'x-');

      const body = await request.json();

      return HttpResponse.json({
        path,
        query,
        header,
        body,
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

function getQueryParameters<
  T extends
    | {
        getQueryKey: (arg: never) => unknown;
      }
    | {
        getMutationKey: (arg: never) => unknown;
      },
>(url: string): ServiceQueryParameters<T> {
  return queryString.parse(url.split('?')[1]) as ServiceQueryParameters<T>;
}

function getHeaders<
  T extends
    | {
        getQueryKey: (arg: never) => unknown;
      }
    | {
        getMutationKey: (arg: never) => unknown;
      },
>(headers: Headers, prefix: string): ServiceHeaderParameters<T> {
  return Array.from(headers.entries()).reduce(
    (acc, [headerKey, headerValue]) => {
      if (!headerKey.toLowerCase().startsWith(prefix.toLowerCase())) return acc;
      if (typeof headerValue !== 'string') return acc;
      return {
        ...acc,
        [headerKey]: headerValue,
      };
    },
    {} as Record<string, string>
  ) as ServiceHeaderParameters<T>;
}

type ServiceHeaderParameters<
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
  ? QueryKey extends { header?: infer Parameters }
    ? Parameters
    : unknown
  : T extends {
        getMutationKey: (arg: infer MutationKey) => unknown;
      }
    ? MutationKey extends { header?: infer Parameters }
      ? Parameters
      : unknown
    : never;

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
  ? QueryKey extends { path?: infer Parameters }
    ? Parameters & { 0: string }
    : unknown
  : T extends {
        getMutationKey: (arg: infer MutationKey) => unknown;
      }
    ? MutationKey extends { path?: infer Parameters }
      ? Parameters & { 0: string }
      : unknown
    : never;

type ServiceQueryParameters<
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
  ? QueryKey extends { query?: infer Parameters }
    ? Parameters
    : unknown
  : T extends {
        getMutationKey: (arg: infer MutationKey) => unknown;
      }
    ? MutationKey extends { query?: infer Parameters }
      ? Parameters
      : unknown
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
