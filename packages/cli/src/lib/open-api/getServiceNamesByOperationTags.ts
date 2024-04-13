import { getServiceName } from './getServiceName.js';

export const getServiceNamesByOperationTags = (
  tags: (string | number | null | undefined)[] | undefined,
  fallbackBaseName: string
): string[] => {
  const filteredTags = tags
    ?.filter((tag): tag is string => typeof tag === 'string')
    .map(getServiceName)
    .filter(Boolean);

  return filteredTags?.length
    ? filteredTags
    : [getServiceName(fallbackBaseName)];
};
