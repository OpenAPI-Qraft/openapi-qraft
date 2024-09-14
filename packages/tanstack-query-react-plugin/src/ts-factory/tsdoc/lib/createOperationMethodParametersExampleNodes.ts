import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/getServices';
import camelcase from 'camelcase';
import ts from 'typescript';

export const createOperationMethodParametersExampleNodes = (
  operation: ServiceOperation,
  transformOperationParameterIdentifier?: (
    operationParameter: NonNullable<ServiceOperation['parameters']>[number]
  ) => string
): ts.PropertyAssignment[] => {
  if (!operation.parameters) return [];

  const parametersTypeList = operation.parameters
    .map((parameter) => parameter.in)
    .filter(
      (parameterKind, index, array) => array.indexOf(parameterKind) === index
    );

  const operationRequiredParameters = operation.parameters.filter(
    (parameter) => parameter.required
  );

  return parametersTypeList.reduce<ts.PropertyAssignment[]>(
    (acc, parameterKind) => {
      let operationParameters = operationRequiredParameters.filter(
        (parameter) => parameter.in === parameterKind
      );

      if (!operationParameters.length) {
        const operationParameter = operation.parameters?.find(
          (parameter) => parameter.in === parameterKind
        );
        if (operationParameter) {
          operationParameters = [operationParameter];
        }
      }

      if (!operationParameters.length) return acc;

      const factory = ts.factory;

      return [
        ...acc,
        factory.createPropertyAssignment(
          factory.createIdentifier(parameterKind),
          factory.createObjectLiteralExpression(
            operationParameters.map((parameter) =>
              factory.createPropertyAssignment(
                factory.createStringLiteral(parameter.name),
                parameter.example // todo:: add example type inferring
                  ? factory.createStringLiteral(parameter.example)
                  : factory.createIdentifier(
                      transformOperationParameterIdentifier
                        ? transformOperationParameterIdentifier(parameter)
                        : camelcase(parameter.name)
                    )
              )
            ),
            true
          )
        ),
      ];
    },
    []
  );
};
