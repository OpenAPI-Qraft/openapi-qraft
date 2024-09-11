import type {
  HeadersOptions,
  OperationSchema,
  RequestFn,
  RequestFnInfo,
  RequestFnOptions,
  RequestFnPayload,
  RequestFnResponse,
} from '@openapi-qraft/tanstack-query-react-types';

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
 * It's needed to create a custom `requestFn` with a custom `urlSerializer`
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

  const requestBody = options.bodySerializer(requestSchema, requestInfo);

  const baseFetch = options.fetch ?? fetch;

  return baseFetch(options.urlSerializer(requestSchema, requestInfo), {
    method: requestSchema.method.toUpperCase(),
    body: requestBody,
    headers: mergeHeaders(
      {
        Accept: 'application/json',
        'Content-Type': requestSchema.mediaType ?? getBodyContentType(body),
      },
      headers,
      parameters?.header,
      requestBody instanceof FormData
        ? // remove `Content-Type` if the serialized body is FormData; the browser will correctly set Content-Type & boundary expression
          { 'Content-Type': null }
        : undefined
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
  info: RequestFnPayload
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
  info: RequestFnPayload
) {
  if (info.body === undefined) return;

  if (
    schema.method === 'get' ||
    schema.method === 'head' ||
    schema.method === 'options'
  )
    return;

  if (schema.mediaType?.includes('/form-data'))
    return getRequestBodyFormData(info);

  if (
    !schema.mediaType?.includes('/json') &&
    (typeof info.body === 'string' ||
      info.body instanceof Blob ||
      info.body instanceof FormData)
  ) {
    return info.body;
  }

  return JSON.stringify(info.body);
}

function getRequestBodyFormData({
  body,
}: Pick<RequestFnPayload, 'body'>): FormData | undefined {
  if (body instanceof FormData) return body;
  if (body === null) return;

  if (body instanceof Blob) throw new Error('Blob not supported in form-data');
  if (body instanceof ArrayBuffer)
    throw new Error('ArrayBuffer not supported in form-data');
  if (body instanceof URLSearchParams)
    throw new Error('URLSearchParams not supported in form-data');
  if (body instanceof ReadableStream)
    throw new Error('ReadableStream not supported in form-data');
  if (typeof body === 'string')
    throw new Error('String not supported in form-data');
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

function getBodyContentType(body: RequestFnPayload['body']) {
  if (!body) return;
  if (body instanceof Blob) return body.type || 'application/octet-stream';
  if (typeof body === 'string') return 'text/plain';
  if (!(body instanceof FormData)) return 'application/json';
}

async function processResponse<TData, TError>(
  response: Response
): Promise<RequestFnResponse<TData, TError>> {
  if (response.status === 204 || response.headers.get('Content-Length') === '0')
    return (
      response.ok ? { data: {}, response } : { error: {}, response }
    ) as RequestFnResponse<TData, TError>;

  if (isJsonResponse(response)) {
    // clone response before parsing every time to allow multiple reads
    const jsonResponse = response.clone().json();
    return resolveResponse(
      response,
      response.ok ? jsonResponse : Promise.reject(await jsonResponse)
    );
  }

  const jsonResponse = new Promise<TData>((resolve, reject) =>
    // attempt to parse JSON for successful responses, otherwise fail
    response.clone().text().then(JSON.parse).then(resolve, reject)
  );

  return resolveResponse(
    response,
    response.ok ? jsonResponse : Promise.reject(await jsonResponse)
  );
}

function isJsonResponse(response: Response) {
  const contentType = response.headers.get('Content-Type')?.toLowerCase();
  return contentType?.includes('/json') || contentType?.includes('+json');
}

function resolveResponse<TData, TError>(
  error: Error
): Promise<RequestFnResponse<TData, TError>>;
function resolveResponse<TData, TError>(
  responseToReturn: Response,
  responsePromise: Promise<TData>
): Promise<RequestFnResponse<TData, TError>>;
function resolveResponse<TData, TError>(
  responseToReturn: Response | Error,
  responsePromise?: Promise<TData>
): Promise<RequestFnResponse<TData, TError>> {
  if (!responsePromise)
    return Promise.reject({
      error: responseToReturn,
      response: undefined,
      data: undefined,
    });

  return responsePromise
    .then(
      (data) =>
        ({ data, response: responseToReturn }) as RequestFnResponse<
          TData,
          TError
        >
    )
    .catch(
      (error) =>
        ({ error, response: responseToReturn }) as RequestFnResponse<
          TData,
          TError
        >
    );
}

type WithRequired<T, K extends keyof T> = T & {
  [_ in K]: {};
};

export type {
  RequestFn,
  RequestFnResponse,
  HeadersOptions,
  RequestFnPayload,
  RequestFnOptions,
  RequestFnInfo,
  OperationSchema,
};
