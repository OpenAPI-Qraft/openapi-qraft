import type { Services } from '../fixtures/api/index.js';
import { http, HttpResponse } from 'msw';
import queryString from 'query-string';
import { services } from '../fixtures/api/index.js';

export const handlers = [
  http.get<
    ServiceOperationPath<Services['approvalPolicies']['getApprovalPoliciesId']>,
    undefined,
    ServiceOperationResponseData<
      Services['approvalPolicies']['getApprovalPoliciesId']
    >
  >(
    convertPathToMSW(
      services.approvalPolicies.getApprovalPoliciesId.schema.url
    ),
    ({ params: { '0': _, ...path }, request }) => {
      const query = getQueryParameters<
        Services['approvalPolicies']['getApprovalPoliciesId']
      >(request.url);

      const header = getHeaders<
        Services['approvalPolicies']['getApprovalPoliciesId']
      >(request.headers, ['x-', 'Authorization']);

      // @ts-expect-error - test invalid parameter
      if (query?.not_existing_approval_policy_query_parameter)
        throw HttpResponse.error();

      if (
        !path.approval_policy_id ||
        path.approval_policy_id === '{approval_policy_id}'
      )
        return HttpResponse.json(
          { error: { message: 'approval_policy_id is required' } },
          {
            status: 404,
            type: 'basic',
            headers: { 'Content-Type': 'application/json' },
          }
        );

      return HttpResponse.json({
        path,
        query,
        header,
      });
    }
  ),

  http.patch<
    ServiceOperationPath<
      Services['approvalPolicies']['patchApprovalPoliciesId']
    >,
    ServiceOperationRequestBody<
      Services['approvalPolicies']['patchApprovalPoliciesId']
    >,
    ServiceOperationResponseData<
      Services['approvalPolicies']['patchApprovalPoliciesId']
    >
  >(
    convertPathToMSW(
      services.approvalPolicies.patchApprovalPoliciesId.schema.url
    ),
    async ({ params: { '0': _, ...path }, request }) => {
      const body = await request.json();

      return HttpResponse.json({
        name: body.name!,
        description: body.description!,
        id: path.approval_policy_id,
      });
    }
  ),

  http.post<
    ServiceOperationPath<Services['entities']['postEntitiesIdDocuments']>,
    ServiceOperationRequestBody<
      Services['entities']['postEntitiesIdDocuments']
    >,
    ServiceOperationResponseData<
      Services['entities']['postEntitiesIdDocuments']
    >
  >(
    convertPathToMSW(services.entities.postEntitiesIdDocuments.schema.url),
    async ({ params: { '0': _, ...path }, request }) => {
      const query = getQueryParameters<
        Services['entities']['postEntitiesIdDocuments']
      >(request.url);

      const header = getHeaders<
        Services['entities']['postEntitiesIdDocuments']
      >(request.headers, ['x-', 'Authorization']);

      const body = await request.json();

      return HttpResponse.json({
        path,
        query,
        header,
        body,
      });
    }
  ),

  http.post<
    ServiceOperationPath<Services['files']['postFiles']>,
    ServiceOperationRequestBody<Services['files']['postFiles']>,
    ServiceOperationResponseData<Services['files']['postFiles']>
  >(
    convertPathToMSW(services.files.postFiles.schema.url),
    async ({ request }) => {
      const formData = Object.fromEntries(await request.formData()) as Awaited<
        ReturnType<typeof request.json>
      >;

      const body: Record<string, any> = {};

      for (const [key, value] of Object.entries(formData)) {
        // some workaround to make it work, since value instanceof (File | Blob) is not working by some reason
        if (
          !value ||
          typeof value === 'string' ||
          value.type !== 'application/octet-stream'
        ) {
          body[key] = value;
          continue;
        }
        body[key] = (value as File).name;
      }

      return HttpResponse.json({ body });
    }
  ),

  http.delete<
    ServiceOperationPath<Services['files']['deleteFiles']>,
    ServiceOperationRequestBody<Services['files']['deleteFiles']>,
    ServiceOperationResponseData<Services['files']['deleteFiles']>
  >(
    convertPathToMSW(services.files.postFiles.schema.url),
    async ({ request }) => {
      const query = getQueryParameters<Services['files']['deleteFiles']>(
        request.url
      );
      return HttpResponse.json({ query });
    }
  ),

  http.get<
    ServiceOperationPath<Services['files']['getFiles']>,
    undefined,
    ServiceOperationResponseData<Services['files']['getFiles']>
  >(convertPathToMSW(services.files.getFiles.schema.url), ({ request }) => {
    const query = getQueryParameters<Services['files']['getFiles']>(
      request.url
    );

    const header = getHeaders<Services['files']['getFiles']>(request.headers, [
      'x-',
      'Authorization',
    ]);

    return HttpResponse.json({
      query,
      header,
    });
  }),

  http.get<
    ServiceOperationPath<Services['files']['findAll']>,
    undefined,
    ServiceOperationResponseData<Services['files']['findAll']>
  >(convertPathToMSW(services.files.findAll.schema.url), () => {
    return HttpResponse.json(filesFindAllResponsePayloadFixtures);
  }),
];

export const filesFindAllResponsePayloadFixtures = {
  data: [
    {
      id: '1',
      url: 'http://localhost:3000/1',
      name: 'file1',
      file_type: 'pdf',
    },
    {
      id: '2',
      url: 'http://localhost:3000/2',
      name: 'file2',
      file_type: 'pdf',
    },
    {
      id: '3',
      url: 'http://localhost:3000/3',
      name: 'file3',
      file_type: 'pdf',
    },
  ],
};

function convertPathToMSW(url: string) {
  return `*${url.replace(
    /{(.*?)}/g,
    (substring: string, group: string) => `:${group}`
  )}`;
}

function getQueryParameters<
  TService extends {
    schema: {
      method: string;
    };
  },
>(url: string): ServiceOperationQuery<TService> | undefined {
  const parsedParams = queryString.parse(
    url.split('?')[1]
  ) as ServiceOperationQuery<TService>;

  return Object.values(parsedParams as {}).length ? parsedParams : undefined;
}

function getHeaders<
  TService extends {
    schema: {
      method: string;
    };
  },
>(headers: Headers, prefixes: string[]): ServiceOperationHeaders<TService> {
  return Array.from(headers.entries()).reduce(
    (acc, [headerKey, headerValue]) => {
      if (
        !prefixes.some((prefix) =>
          headerKey.toLowerCase().startsWith(prefix.toLowerCase())
        )
      )
        return acc;

      if (typeof headerValue !== 'string') return acc;

      return {
        ...acc,
        [headerKey]: headerValue,
      };
    },
    {} as Record<string, string>
  ) as ServiceOperationHeaders<TService>;
}

type ServiceOperationHeaders<
  TService extends {
    schema: {
      method: string;
    };
  },
> = TService extends {
  schema: {
    method: 'get' | 'head' | 'options';
  };
  types: {
    parameters?: {
      header?: infer Header;
    };
  };
}
  ? NonNullable<Header> extends never
    ? unknown
    : Header
  : TService extends {
        types: {
          parameters?: {
            header?: infer Header;
          };
        };
      }
    ? NonNullable<Header> extends never
      ? unknown
      : Header
    : never;

type ServiceOperationPath<
  TServices extends {
    schema: {
      method: string;
    };
  },
> = TServices extends {
  schema: {
    method: 'get' | 'head' | 'options';
  };
  types: {
    parameters?: {
      path?: infer Path;
    };
  };
}
  ? NonNullable<Path> extends never
    ? { '0': string }
    : { '0': string } & Path
  : TServices extends {
        types: {
          parameters?: {
            path?: infer Path;
          };
        };
      }
    ? NonNullable<Path> extends never
      ? { '0': string }
      : { '0': string } & Path
    : never;

type ServiceOperationQuery<
  TService extends {
    schema: {
      method: string;
    };
  },
> = TService extends {
  schema: {
    method: 'get' | 'head' | 'options';
  };
  types: {
    parameters?: {
      query?: infer Parameters;
    };
  };
}
  ? NonNullable<Parameters> extends never
    ? unknown
    : Parameters
  : TService extends {
        types: {
          parameters?: {
            query?: infer Parameters;
          };
        };
      }
    ? NonNullable<Parameters> extends never
      ? unknown
      : Parameters
    : never;

type ServiceOperationRequestBody<
  TService extends {
    schema: {
      method: string;
    };
  },
> = TService extends {
  schema: {
    method: 'get' | 'head' | 'options';
  };
}
  ? never
  : TService extends {
        types: {
          body?: infer Body;
        };
      }
    ? Body
    : never;

type ServiceOperationResponseData<
  TService extends {
    schema: {
      method: string;
    };
  },
> = TService extends {
  schema: {
    method: 'get' | 'head' | 'options';
  };
  types: {
    data?: infer Data;
    error?: infer Error;
  };
}
  ? IfUnknownThenUndefined<Data> | IfUnknownThenUndefined<Error>
  : TService extends {
        types: {
          data?: infer Data;
          error?: infer Error;
        };
      }
    ? IfUnknownThenUndefined<Data> | IfUnknownThenUndefined<Error>
    : never;

type IfUnknownThenUndefined<T> = T extends unknown ? undefined : T;
