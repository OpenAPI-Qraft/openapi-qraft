import { ApiError } from './ApiError.js';
import { ApiRequestInit, HeadersOptions } from './ApiRequestInit.js';
import type { ApiResult } from './ApiResult.js';
import type { OpenAPIConfig } from './OpenAPI.js';

export const getQueryString = (params: Record<string, any>): string => {
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
};

function getRequestUrlBase(
  config: Pick<OpenAPIConfig, 'version' | 'baseUrl'>,
  { url, parameters }: Pick<ApiRequestInit, 'url' | 'parameters'>
): string {
  let path = url;

  if (typeof config.version !== 'undefined') {
    path = path.replace('{api-version}', config.version);
  }

  path = path.replace(/{(.*?)}/g, (substring: string, group: string) => {
    if (parameters?.path?.hasOwnProperty(group)) {
      return encodeURI(String(parameters?.path[group]));
    }
    return substring;
  });

  if (parameters?.query) {
    return `${config.baseUrl}${path}${getQueryString(parameters.query)}`;
  }
  return `${config.baseUrl}${path}`;
}

export { getRequestUrlBase as getRequestUrl };

const getBodyContentType = (body: ApiRequestInit['body']) => {
  if (!body) return;
  if (body instanceof Blob) return body.type || 'application/octet-stream';
  if (typeof body === 'string') return 'text/plain';
  if (!(body instanceof FormData)) return 'application/json';
};

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

function getRequestBodyBase(options: {
  method: ApiRequestInit['method'];
  mediaType: ApiRequestInit['mediaType'];
  body: ApiRequestInit['body'];
}) {
  if (
    options.method === 'get' ||
    options.method === 'head' ||
    options.method === 'options'
  )
    return;

  if (options.mediaType?.includes('/form-data')) return getFormData(options);

  return getBody(options);
}

export { getRequestBodyBase as getRequestBody };

const getFormData = ({
  body,
}: Pick<ApiRequestInit, 'body'>): FormData | undefined => {
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
};

const getBody = (options: {
  mediaType: ApiRequestInit['mediaType'];
  body: ApiRequestInit['body'];
}): any => {
  if (options.body === undefined) return;

  if (
    !options.mediaType?.includes('/json') &&
    (typeof options.body === 'string' ||
      options.body instanceof Blob ||
      options.body instanceof FormData)
  ) {
    return options.body;
  }

  return JSON.stringify(options.body);
};

export const sendRequest = async (
  options: ApiRequestInit,
  url: string,
  body: BodyInit | undefined,
  headers: Headers
): Promise<Response> => {
  const request: RequestInit = {
    headers,
    body: body,
    method: options.method.toUpperCase(),
    signal: options.signal,
  };

  return await fetch(url, request);
};

export const getResponseBody = async (response: Response): Promise<any> => {
  if (response.status !== 204) {
    try {
      const contentType = response.headers.get('Content-Type');
      if (contentType) {
        const jsonTypes = ['application/json', 'application/problem+json'];
        const isJSON = jsonTypes.some((type) =>
          contentType.toLowerCase().startsWith(type)
        );
        if (isJSON) {
          return await response.json();
        } else {
          return await response.text();
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  return undefined;
};

export const catchErrorCodes = (
  options: ApiRequestInit,
  result: ApiResult
): void => {
  const errors: Record<number, string> = {
    ...Object.fromEntries(
      options.errors?.map((code) => [code, 'API Error']) ?? []
    ),
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };

  const error = errors[result.status];

  if (error) {
    throw new ApiError(options, result, error);
  }

  if (!result.ok) {
    const errorStatus = result.status ?? 'unknown';
    const errorStatusText = result.statusText ?? 'unknown';
    const errorBody = (() => {
      try {
        return JSON.stringify(result.body, null, 2);
      } catch (e) {
        return undefined;
      }
    })();

    throw new ApiError(
      options,
      result,
      `Generic Error: status: ${errorStatus}; status text: ${errorStatusText}; body: ${errorBody}`
    );
  }
};

/**
 * Request method
 * @param config The OpenAPI configuration object
 * @param requestInit The request options from the service
 * @param getRequestUrl The function to get the request URL
 * @param getRequestBody The function to get the request body
 * @returns Promise<T>
 * @throws ApiError
 */
export async function request<T>(
  config: OpenAPIConfig,
  requestInit: ApiRequestInit,
  {
    getRequestUrl,
    getRequestBody,
  }: {
    getRequestUrl: typeof getRequestUrlBase;
    getRequestBody: typeof getRequestBodyBase;
  }
): Promise<T> {
  const {
    method,
    url,
    parameters,
    mediaType,
    errors,
    headers,
    body,
    ...requestInitRest
  } = requestInit;

  const response = await fetch(getRequestUrl(config, { url, parameters }), {
    body: getRequestBody({
      method,
      mediaType,
      body,
    }),
    headers: new Headers(
      mergeHeaders(
        {
          Accept: 'application/json',
          'Content-Type': mediaType ?? getBodyContentType(body),
        },
        headers,
        parameters?.header
      )
    ),
    method: method.toUpperCase(),
    ...requestInitRest,
  });

  const responseBody = await getResponseBody(response);

  const result: ApiResult = {
    url,
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    body: responseBody,
  };

  catchErrorCodes(requestInit, result); // todo::refactor to return result

  return result.body;
}
