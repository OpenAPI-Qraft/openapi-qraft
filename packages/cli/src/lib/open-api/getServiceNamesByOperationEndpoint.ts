import { getServiceName } from './getServiceName.js';

export type ServiceBaseNameByEndpointOption =
  | `endpoint[${number}]`
  | 'endpoint';

export const getServiceNamesByOperationEndpoint = (
  endpoint: string,
  format: ServiceBaseNameByEndpointOption,
  fallbackBaseName: string
): [string] => {
  return [
    getServiceName(
      getServiceBaseNameByOperationEndpoint(endpoint, format) ??
        fallbackBaseName
    ),
  ];
};

export const getServiceBaseNameByOperationEndpoint = (
  endpoint: string,
  format: ServiceBaseNameByEndpointOption
): string | undefined => {
  const endpointParts = endpoint.split('/').filter(Boolean);

  for (
    let endpointIndex = getEndpointPartIndex(format);
    endpointIndex >= 0;
    endpointIndex--
  ) {
    const endpointPart = endpointParts[endpointIndex];
    if (endpointPart) return endpointPart;
  }
};

export const getEndpointPartIndex = (
  endpointOption: ServiceBaseNameByEndpointOption
) => {
  if (endpointOption === 'endpoint') return 0;

  const startBracketString = 'endpoint[';

  const endpointIndexStart = endpointOption.indexOf(startBracketString);

  if (endpointIndexStart === -1)
    throw new Error(
      `Expected endpoint to start with '${startBracketString}' but got: '${endpointOption}'`
    );

  const endBracketString = ']';
  const endpointIndexEnd = endpointOption.indexOf(
    endBracketString,
    endpointIndexStart
  );

  if (endpointIndexEnd === -1)
    throw new Error(
      `Expected endpoint to end with '${endBracketString}' but got: '${endpointOption}'`
    );

  const endpointIndex = parseInt(
    endpointOption.slice(
      endpointIndexStart + startBracketString.length,
      endpointIndexEnd
    )
  );

  if (!isFinite(endpointIndex))
    throw new Error(
      `Expected endpoint index to be a number but got: '${endpointOption}'`
    );

  return endpointIndex;
};
