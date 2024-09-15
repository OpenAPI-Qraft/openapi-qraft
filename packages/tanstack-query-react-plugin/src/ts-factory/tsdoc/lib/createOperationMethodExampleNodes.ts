import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/getServices';
import ts from 'typescript';

export const createOperationMethodExampleNodes = (
  operation: ServiceOperation,
  {
    serviceVariableName,
    operationMethodName,
  }: { serviceVariableName: string; operationMethodName: string },
  nodes: ts.Expression[] | undefined
) => {
  const factory = ts.factory;

  return [
    factory.createExpressionStatement(
      factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createPropertyAccessExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier('qraft'),
              factory.createIdentifier(serviceVariableName)
            ),
            factory.createIdentifier(operation.name)
          ),
          factory.createIdentifier(operationMethodName)
        ),
        undefined,
        nodes
      )
    ),
  ];
};
