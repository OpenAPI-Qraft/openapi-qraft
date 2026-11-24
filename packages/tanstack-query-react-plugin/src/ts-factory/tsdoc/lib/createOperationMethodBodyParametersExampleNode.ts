import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import ts from 'typescript';

export const createOperationMethodBodyParametersExampleNode = (
  operation: ServiceOperation,
  bodyVariableName = 'queryBody'
) =>
  operation.requestBody
    ? ts.factory.createPropertyAssignment(
        ts.factory.createIdentifier('body'),
        ts.factory.createIdentifier(bodyVariableName)
      )
    : undefined;
