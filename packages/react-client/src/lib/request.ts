/**
 * @throws {error: object|string, response: Response} if the request fails
 */
export async function request<T>(
  options: RequestOptions,
  requestInfo: APIOperationSchema,
  requestInit: APIOperationRequestInfo
): Promise<T> {
  return baseRequest(
    isRequiredRequestOptions(options)
      ? options
      : {
          urlSerializer,
          bodySerializer,
          ...options,
        },
    requestInfo,
    requestInit
  );
}

export interface RequestOptions {
  baseUrl: string;
  urlSerializer?: URLSerializer;
  bodySerializer?: BodySerializer;
}

type URLSerializer = typeof urlSerializer;
type BodySerializer = typeof bodySerializer;

/**
 * @throws {error: object|string, response: Response} if the request fails
 */
export async function baseRequest<T>(
  options: Required<RequestOptions>,
  schema: APIOperationSchema,
  requestInfo: APIOperationRequestInfo,
  customFetch = fetch
): Promise<T> {
  const { parameters, headers, body, ...requestInfoRest } = requestInfo;

  const requestBody = options.bodySerializer(schema, requestInfo);

  const response = await customFetch(
    options.urlSerializer(options.baseUrl, schema, requestInfo),
    {
      method: schema.method.toUpperCase(),
      body: requestBody,
      headers: mergeHeaders(
        {
          Accept: 'application/json',
          'Content-Type': schema.mediaType ?? getBodyContentType(body),
        },
        headers,
        parameters?.header,
        requestBody instanceof FormData
          ? // remove `Content-Type` if serialized body is FormData; browser will correctly set Content-Type & boundary expression
            { 'Content-Type': null }
          : undefined
      ),
      ...requestInfoRest,
    }
  );

  // clone response to allow multiple reads
  const clonedResponse = response.clone();

  if (!response.ok) {
    throw await getResponseBody(clonedResponse);
  }

  return (await getResponseBody(clonedResponse)) as T;
}

export function urlSerializer(
  baseUrl: string,
  schema: APIOperationSchema,
  info: APIOperationRequestInfo
): string {
  const path = schema.url.replace(
    /{(.*?)}/g,
    (substring: string, group: string) => {
      if (info.parameters?.path?.hasOwnProperty(group)) {
        return encodeURI(String(info.parameters?.path[group]));
      }
      return substring;
    }
  );

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

function mergeHeaders(...allHeaders: (HeadersOptions | undefined)[]) {
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
  schema: APIOperationSchema,
  info: APIOperationRequestInfo
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
}: Pick<APIOperationRequestInfo, 'body'>): FormData | undefined {
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

function getBodyContentType(body: APIOperationRequestInfo['body']) {
  if (!body) return;
  if (body instanceof Blob) return body.type || 'application/octet-stream';
  if (typeof body === 'string') return 'text/plain';
  if (!(body instanceof FormData)) return 'application/json';
}

async function getResponseBody<T>(response: Response): Promise<T | undefined> {
  if (response.status === 204 || response.headers.get('Content-Length') === '0')
    return undefined;

  const contentType = response.headers.get('Content-Type')?.toLowerCase();
  const isJSON =
    contentType?.includes('/json') || contentType?.includes('+json');

  if (isJSON) {
    // attempt to parse JSON for successful responses, otherwise fail
    if (response.ok) return response.json();

    const errorFallbackResponse = response.clone(); // clone to allow multiple reads

    return response.json().catch(() => {
      if (
        typeof process !== 'undefined' &&
        typeof process.env !== 'undefined' &&
        process.env.NODE_ENV === 'development'
      ) {
        console.warn(
          'Failed to parse response body as JSON. Falling back to .text()'
        );
      }
      // falling back to .text() when necessary for error messages
      return errorFallbackResponse.text();
    });
  }

  return response.text() as Promise<T>;
}

function isRequiredRequestOptions<T extends RequestOptions>(
  options: RequestOptions
): options is Required<RequestOptions> {
  return Boolean(options.urlSerializer && options.bodySerializer);
}

// To have definitely typed headers without a conversion to stings
export type HeadersOptions =
  | HeadersInit
  | Record<string, string | number | boolean | null | undefined>;

export interface APIOperationSchema {
  /**
   * Operation path
   * @example /user/{id}
   */
  readonly url: string;

  /**
   * Operation method
   */
  readonly method:
    | 'get'
    | 'put'
    | 'post'
    | 'patch'
    | 'delete'
    | 'options'
    | 'head'
    | 'trace';

  /**
   * Media type of the request body
   * @example application/json
   */
  readonly mediaType?: string;
}

export interface APIOperationRequestInfo
  extends Omit<RequestInit, 'headers' | 'method' | 'body'> {
  /**
   * OpenAPI parameters
   * @example
   * ```ts
   * { path: {id: 1}, query: {search: 'hello'} }
   * ```
   */
  readonly parameters?: {
    readonly path?: Record<string, any>;
    readonly cookie?: Record<string, any>;
    readonly header?: Record<string, any>;
    readonly query?: Record<string, any>;
  };
  /**
   * Request body
   * @example { name: 'John' }
   */
  readonly body?: BodyInit | Record<string, unknown> | null;
  /**
   * Request headers
   * @example { 'X-Auth': '123' }
   */
  readonly headers?: HeadersOptions;

  /**
   * Tanstack Query Meta
   */
  meta?: Record<string, unknown>;
}
