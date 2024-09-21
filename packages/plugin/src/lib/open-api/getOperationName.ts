import type { ServiceBaseNameByEndpointOption } from './getServiceNamesByOperationEndpoint.js';
import type { ServiceBaseName } from './getServices.js';
import camelcase from 'camelcase';
import { getEndpointPartIndex } from './getServiceNamesByOperationEndpoint.js';

/**
 * Convert the input value to a correct operation (method) classname.
 * This will use the operation ID - if available - and otherwise fallback
 * on a generated name from the URL
 */
export const getOperationName = (
  url: string,
  method: string,
  operationId: string | undefined,
  serviceNameBase: ServiceBaseName
): string => {
  if (operationId) return getOperationIdName(operationId);

  const urlWithoutPlaceholders = (
    serviceNameBase === 'tags'
      ? url
      : reduceUrlByEndpointPartIndex(url, serviceNameBase)
  )
    .replace(/{(.*?)}/g, '$1')
    .replace(/\//g, '-');

  return camelcase(`${method}-${urlWithoutPlaceholders}`);
};

export const getOperationIdName = (operationId: string): string => {
  return camelcase(
    operationId
      .replace(/^[^a-zA-Z]+/g, '')
      .replace(/[^\w-]+/g, '-')
      .trim()
  );
};

export const reduceUrlByEndpointPartIndex = (
  url: string,
  serviceNameBase: ServiceBaseNameByEndpointOption
) => {
  const reducedPath = (url.startsWith('/') ? url.slice(1) : url)
    .split('/')
    .slice(getEndpointPartIndex(serviceNameBase))
    .join('/');

  return url.startsWith('/') ? `/${reducedPath}` : reducedPath;
};
