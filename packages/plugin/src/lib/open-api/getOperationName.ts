import camelCase from 'camelcase';

/**
 * Convert the input value to a correct operation (method) classname.
 * This will use the operation ID - if available - and otherwise fallback
 * on a generated name from the URL
 */
export const getOperationName = (
  url: string,
  method: string,
  operationId: string | undefined
): string => {
  if (operationId) return getOperationIdName(operationId);

  const urlWithoutPlaceholders = url
    .replace(/{(.*?)}/g, '$1')
    .replace(/\//g, '-');

  return camelCase(`${method}-${urlWithoutPlaceholders}`);
};

export const getOperationIdName = (operationId: string): string => {
  return camelCase(
    operationId
      .replace(/^[^a-zA-Z]+/g, '')
      .replace(/[^\w-]+/g, '-')
      .trim()
  );
};
