import type {
  HeadersOptions,
  OperationSchema,
  RequestFnInfo,
  RequestFnOptions,
  RequestFnResponse,
} from '@openapi-qraft/tanstack-query-react-types';
import { processResponse, resolveResponse } from './responseUtils.js';

/**
 * This function is used to make a request to a specified endpoint.
 *
 * @template T The expected return type of the request.
 *
 * @param schema The schema of the operation to be performed. It includes the OpenAPI path, HTTP method and media type.
 * @param requestInfo The information required to make the request. It includes parameters, headers, body, etc.
 * @param [options] Optional. Additional options for the request. It includes custom urlSerializer, bodySerializer, and fetch function.
 *
 * @returns {Promise<T>} Returns a promise that resolves with the response of the request.
 *
 * @throws {error: object|string, response: Response} Throws an error if the request fails. The error includes the error message and the response from the server.
 */
export async function requestFn<TData, TError>(
  schema: OperationSchema,
  requestInfo: RequestFnInfo,
  options?: RequestFnOptions
): Promise<RequestFnResponse<TData, TError>> {
  return baseRequestFn<TData, TError>(schema, requestInfo, {
    urlSerializer,
    bodySerializer,
    ...options,
  });
}

/**
 * This function is used to make a request to a specified endpoint.
 * It's necessary to create a custom `requestFn` with a custom `urlSerializer`
 * and `bodySerializer`, with the tree-shaking of the default `requestFn`
 * and its serializers.
 *
 * @template T The expected return type of the request.
 *
 * @param requestSchema The schema of the operation to be performed. It includes the OpenAPI path, HTTP method and media type.
 * @param requestInfo The information required to make the request. It includes parameters, headers, body, etc.
 * @param options The options for the request. It includes urlSerializer, bodySerializer, and fetch function. The 'urlSerializer' and 'bodySerializer' are required.
 *
 * @returns {Promise<T>} Returns a promise that resolves with the response of the request.
 *
 * @throws {error: object|string, response: Response} Throws an error if the request fails. The error includes the error message and the response from the server.
 */
export async function baseRequestFn<TData, TError>(
  requestSchema: OperationSchema,
  requestInfo: RequestFnInfo,
  options: WithRequired<RequestFnOptions, 'urlSerializer' | 'bodySerializer'>
): Promise<RequestFnResponse<TData, TError>> {
  const { parameters, headers, body, ...requestInfoRest } = requestInfo;

  const requestPayload = options.bodySerializer(requestSchema, body);

  const baseFetch = options.fetch ?? fetch;

  return baseFetch(options.urlSerializer(requestSchema, requestInfo), {
    method: requestSchema.method.toUpperCase(),
    body: requestPayload?.body,
    headers: mergeHeaders(
      { Accept: 'application/json' },
      requestPayload?.headers,
      headers,
      parameters?.header
    ),
    ...requestInfoRest,
  })
    .then(processResponse as typeof processResponse<TData, TError>)
    .catch(resolveResponse as typeof resolveResponse<TData, TError>);
}

/**
 * Serializes the given schema and request payload into a URL string.
 *
 * This function is implemented according to the URI Template standard
 * defined in RFC 6570. It supports the expansion of path and query parameters,
 * correctly handling empty arrays, `null`, and `undefined` values by ignoring
 * them during the expansion process, as specified by the standard.
 *
 * For more information, refer to the official documentation:
 * https://datatracker.ietf.org/doc/html/rfc6570
 *
 * @param schema - The operation schema containing the URL template and method.
 * @param info - The request payload including baseUrl, path parameters, and query parameters.
 * @returns The fully constructed URL string.
 */
export function urlSerializer(
  schema: OperationSchema,
  info: Pick<RequestFnInfo, 'baseUrl' | 'parameters'>
): string {
  const path = schema.url.replace(
    /{(.*?)}/g,
    (substring: string, group: string) => {
      if (
        info.parameters?.path &&
        Object.prototype.hasOwnProperty.call(info.parameters.path, group)
      ) {
        return encodeURI(String(info.parameters?.path[group]));
      }
      return substring;
    }
  );

  const baseUrl = info.baseUrl ?? '';

  if (info.parameters?.query) {
    return `${baseUrl}${path}${getQueryString(info.parameters.query)}`;
  }

  return `${baseUrl}${path}`;
}

function getQueryString(params: Record<string, any>): string {
  const qs: string[] = [];

  const append = (key: string, value: any) => {
    qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  };

  const process = (key: string, value: any) => {
    if (typeof value === 'undefined' || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        process(key, v);
      });
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => {
        process(`${key}[${k}]`, v);
      });
    } else {
      append(key, value);
    }
  };

  Object.entries(params).forEach(([key, value]) => {
    process(key, value);
  });

  if (qs.length > 0) {
    return `?${qs.join('&')}`;
  }

  return '';
}

export function mergeHeaders(...allHeaders: (HeadersOptions | undefined)[]) {
  const headers = new Headers();

  for (const headerSet of allHeaders) {
    if (!headerSet || typeof headerSet !== 'object') {
      continue;
    }

    const headersIterator =
      headerSet instanceof Headers
        ? headerSet.entries()
        : Object.entries(headerSet);

    for (const [headerKey, headerValue] of headersIterator) {
      if (headerValue === null) {
        headers.delete(headerKey);
      } else if (headerValue !== undefined) {
        headers.set(headerKey, headerValue);
      }
    }
  }

  return headers;
}

export function bodySerializer(
  schema: OperationSchema,
  body: RequestFnInfo['body']
) {
  if (isReadOnlyOperation(schema)) return undefined;

  if (body === undefined || body === null) return undefined;

  if (typeof body === 'string') {
    return {
      body,
      headers: {
        'Content-Type':
          // prefer text/* media type
          schema.mediaType?.find((mediaType) => mediaType.includes('text/')) ??
          // prefer JSON media type, assume that body is serialized as JSON
          schema.mediaType?.find((mediaType) => mediaType.includes('/json')) ??
          'text/plain',
      },
    };
  }

  if (body instanceof FormData) {
    return {
      body,
      headers: {
        // remove `Content-Type` if the serialized body is FormData;
        // the browser will correctly set Content-Type & boundary expression
        'Content-Type': null,
      },
    };
  }

  if (body instanceof Blob) {
    return {
      body,
      headers: {
        'Content-Type':
          body.type ||
          schema.mediaType?.find(
            (mediaType) =>
              !(
                mediaType.includes('text/') &&
                mediaType.includes('/form-data') &&
                mediaType.includes('/json')
              )
          ) ||
          'application/octet-stream',
      },
    };
  }

  let jsonMediaType: string | null = null;
  let formDataMediaType: string | null = null;

  if (schema.mediaType) {
    for (let i = 0; i < schema.mediaType.length; i++) {
      const mediaType = schema.mediaType[i];
      if (mediaType.includes('/json')) jsonMediaType = mediaType;
      else if (mediaType.includes('/form-data')) formDataMediaType = mediaType;
    }
  }

  if (formDataMediaType) {
    if (
      !jsonMediaType ||
      // Prefer FormData serialization if one of the fields is a Blob
      Object.values(body).some((value) => value instanceof Blob)
    ) {
      return {
        body: getRequestBodyFormData(body),
        headers: {
          // remove `Content-Type` if the serialized body is FormData;
          // the browser will correctly set Content-Type & boundary expression
          'Content-Type': null,
        },
      };
    }
  }

  return {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': jsonMediaType ?? 'application/json',
    },
  };
}

function getRequestBodyFormData(
  body: NonNullable<RequestFnInfo['body']>
): FormData {
  if (body instanceof FormData) return body;
  if (typeof body !== 'object')
    throw new Error(`Unsupported body type ${typeof body} in form-data.`);

  const formData = new FormData();

  const process = (key: string, value: any) => {
    if (typeof value === 'string' || value instanceof Blob) {
      formData.append(key, value);
    } else {
      formData.append(key, JSON.stringify(value));
    }
  };

  Object.entries(body)
    .filter(([_, value]) => typeof value !== 'undefined' && value !== null)
    .forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => process(key, v));
      } else {
        process(key, value);
      }
    });

  return formData;
}

type WithRequired<T, K extends keyof T> = T & {
  [_ in K]: {};
};

export type {
  RequestFn,
  RequestFnResponse,
  HeadersOptions,
  RequestFnOptions,
  RequestFnInfo,
  OperationSchema,
} from '@openapi-qraft/tanstack-query-react-types';

/**
 * @deprecated use `RequestFnInfo` instead
 */
export type RequestFnPayload = RequestFnInfo;

function isReadOnlyOperation(operation: {
  readonly method:
    | 'get'
    | 'put'
    | 'post'
    | 'patch'
    | 'delete'
    | 'options'
    | 'head'
    | 'trace';
}) {
  return (
    operation.method === 'get' ||
    operation.method === 'head' ||
    operation.method === 'trace' ||
    operation.method === 'options'
  );
}
