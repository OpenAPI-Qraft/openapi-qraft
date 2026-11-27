import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';

export const createOperationCommonTSDoc = (
  operation: ServiceOperation,
  deprecationReason?: string
) => {
  const deprecatedTag =
    operation.deprecated && deprecationReason
      ? `@deprecated This operation is deprecated. ${deprecationReason}`
      : deprecationReason
        ? `@deprecated ${deprecationReason}`
        : operation.deprecated
          ? '@deprecated'
          : null;

  return [
    deprecatedTag,
    operation.summary ? `@summary ${operation.summary}` : null,
    operation.description ? `@description ${operation.description}` : null,
  ].filter((comment): comment is NonNullable<typeof comment> =>
    Boolean(comment)
  );
};
