import { ApiRequestInit, HeadersOptions } from './ApiRequestInit.js';

/**
 * @throws {error: object|string, response: Response} if the request fails
 */
export async function request<T>(
  config: { baseUrl: string },
  requestInit: ApiRequestInit,
  {
    getRequestUrl: getRequestUrlFunc,
    getRequestBody: getRequestBodyFunc,
  }: {
    getRequestUrl: typeof getRequestUrl;
    getRequestBody: typeof getRequestBody;
  }
): Promise<T> {
  const {
    method,
    url,
    parameters,
    mediaType,
    headers,
    body,
    ...requestInitRest
  } = requestInit;

  const requestBody = getRequestBodyFunc({
    method,
    mediaType,
    body,
  });

  const response = await fetch(getRequestUrlFunc(config, { url, parameters }), {
    method: method.toUpperCase(),
    body: requestBody,
    headers: mergeHeaders(
      {
        Accept: 'application/json',
        'Content-Type': mediaType ?? getBodyContentType(body),
      },
      headers,
      parameters?.header,
      requestBody instanceof FormData
        ? // remove `Content-Type` if serialized body is FormData; browser will correctly set Content-Type & boundary expression
          { 'Content-Type': null }
        : undefined
    ),
    ...requestInitRest,
  });

  // clone response to allow multiple reads
  const clonedResponse = response.clone();

  if (!response.ok) {
    throw await getResponseBody(clonedResponse);
  }

  return (await getResponseBody(clonedResponse)) as T;
}

export function getRequestUrl(
  config: { baseUrl: string },
  { url, parameters }: Pick<ApiRequestInit, 'url' | 'parameters'>
): string {
  let path = url;

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

export function getQueryString(params: Record<string, any>): string {
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

export function getRequestBody(options: {
  method: ApiRequestInit['method'];
  mediaType: ApiRequestInit['mediaType'];
  body: ApiRequestInit['body'];
}) {
  if (options.body === undefined) return;

  if (
    options.method === 'get' ||
    options.method === 'head' ||
    options.method === 'options'
  )
    return;

  if (options.mediaType?.includes('/form-data'))
    return getRequestBodyFormData(options);

  if (
    !options.mediaType?.includes('/json') &&
    (typeof options.body === 'string' ||
      options.body instanceof Blob ||
      options.body instanceof FormData)
  ) {
    return options.body;
  }

  return JSON.stringify(options.body);
}

function getRequestBodyFormData({
  body,
}: Pick<ApiRequestInit, 'body'>): FormData | undefined {
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

function getBodyContentType(body: ApiRequestInit['body']) {
  if (!body) return;
  if (body instanceof Blob) return body.type || 'application/octet-stream';
  if (typeof body === 'string') return 'text/plain';
  if (!(body instanceof FormData)) return 'application/json';
}

export async function getResponseBody<T>(
  response: Response
): Promise<T | undefined> {
  if (response.status === 204 || response.headers.get('Content-Length') === '0')
    return undefined;

  const contentType = response.headers.get('Content-Type')?.toLowerCase();
  const isJSON =
    contentType?.includes('/json') || contentType?.includes('+json');

  // parse response (falling back to .text() when necessary)
  if (isJSON) return response.json();

  return response.text() as Promise<T>;
}
