import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';

export const createOperationCommonTSDoc = (operation: ServiceOperation) => {
  return [
    operation.deprecated ? '@deprecated' : null,
    operation.summary ? `@summary ${operation.summary}` : null,
    operation.description ? `@description ${operation.description}` : null,
  ].filter((comment): comment is NonNullable<typeof comment> =>
    Boolean(comment)
  );
};
