import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import { factory } from 'typescript';

export const createOperationMethodBodyParametersExampleNode = (
  operation: ServiceOperation,
  bodyVariableName = 'queryBody'
) =>
  operation.requestBody
    ? factory.createPropertyAssignment(
        factory.createIdentifier('body'),
        factory.createIdentifier(bodyVariableName)
      )
    : undefined;
