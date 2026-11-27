import type { ResolveServiceOperationVariableNamesOptions } from './resolveServiceOperationVariableNames.js';
import { OpenAPIService } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import ts from 'typescript';
import {
  createObjectLiteralPropertyName,
  createPropertyName,
} from './createPropertyName.js';
import { reservedBindingNames } from './getOperationVariableNames.js';
import { resolveServiceOperationVariableNames } from './resolveServiceOperationVariableNames.js';

type Options = {
  explicitImportExtensions: '.js' | '.ts' | undefined;
  serviceOptions?: ResolveServiceOperationVariableNamesOptions;
};

type ServiceOperationBinding = {
  operationName: string;
  exportedVariableName: string;
  alias: string;
};

type ServiceBinding = {
  service: OpenAPIService;
  operations: ServiceOperationBinding[];
};

export const getServiceIndexFactory = (
  services: OpenAPIService[],
  options: Options
) => {
  const serviceBindings = resolveServiceBindings(
    services,
    options.serviceOptions
  );

  return [
    ...getServicesImportsFactory(serviceBindings, options),
    getServiceIndexInterfaceFactory(serviceBindings),
    getServiceIndexVariableFactory(serviceBindings),
  ];
};

const getServiceIndexInterfaceFactory = (serviceBindings: ServiceBinding[]) => {
  const factory = ts.factory;

  return factory.createTypeAliasDeclaration(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier('Services'),
    undefined,
    factory.createTypeLiteralNode(
      serviceBindings.map(({ service: { name, typeName } }) =>
        factory.createPropertySignature(
          undefined,
          createPropertyName(name),
          undefined,
          factory.createTypeReferenceNode(
            factory.createIdentifier(typeName),
            undefined
          )
        )
      )
    )
  );
};

const getServiceIndexVariableFactory = (serviceBindings: ServiceBinding[]) => {
  const factory = ts.factory;

  return factory.createVariableStatement(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier('services'),
          undefined,
          factory.createTypeLiteralNode(
            serviceBindings.map(({ service: { name }, operations }) =>
              factory.createPropertySignature(
                undefined,
                createPropertyName(name),
                undefined,
                factory.createTypeLiteralNode(
                  operations.map(({ operationName, alias }) =>
                    factory.createPropertySignature(
                      [factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
                      createPropertyName(operationName),
                      undefined,
                      factory.createTypeQueryNode(
                        factory.createIdentifier(alias),
                        undefined
                      )
                    )
                  )
                )
              )
            )
          ),
          factory.createObjectLiteralExpression(
            serviceBindings.map(({ service: { name }, operations }) =>
              factory.createPropertyAssignment(
                createObjectLiteralPropertyName(name),
                factory.createObjectLiteralExpression(
                  operations.map(({ operationName, alias }) =>
                    factory.createPropertyAssignment(
                      createObjectLiteralPropertyName(operationName),
                      factory.createIdentifier(alias)
                    )
                  ),
                  operations.length > 0
                )
              )
            ),
            true
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  );
};

const getServicesImportsFactory = (
  serviceBindings: ServiceBinding[],
  { explicitImportExtensions }: Options
) => {
  const factory = ts.factory;

  return serviceBindings.map(({ service, operations }) => {
    const moduleSpecifier = `./${service.fileBaseName}${explicitImportExtensions ?? ''}`;

    if (operations.length === 0) {
      return factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          true,
          undefined,
          factory.createNamedImports([
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier(service.typeName)
            ),
          ])
        ),
        factory.createStringLiteral(moduleSpecifier)
      );
    }

    return factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamedImports([
          factory.createImportSpecifier(
            true,
            undefined,
            factory.createIdentifier(service.typeName)
          ),
          ...operations.map(({ exportedVariableName, alias }) =>
            factory.createImportSpecifier(
              false,
              exportedVariableName === alias
                ? undefined
                : factory.createIdentifier(exportedVariableName),
              factory.createIdentifier(alias)
            )
          ),
        ])
      ),
      factory.createStringLiteral(moduleSpecifier)
    );
  });
};

/**
 * Resolves imported operation bindings and guaranteed-unique local aliases across all services.
 */
function resolveServiceBindings(
  services: OpenAPIService[],
  serviceOptions: ResolveServiceOperationVariableNamesOptions = {}
): ServiceBinding[] {
  // Pass 1: compute base aliases and record every base candidate before resolving collisions.
  const serviceOperationsWithBaseAliases = services.map((service) => {
    const operationVariableNames = resolveServiceOperationVariableNames(
      service,
      service.operations,
      serviceOptions
    );

    return {
      service,
      operations: service.operations.map((operation) => ({
        operationName: operation.name,
        exportedVariableName: operationVariableNames.get(operation.name)!,
        baseAlias: createBaseOperationAlias(service.name, operation.name),
      })),
    };
  });

  const allBaseAliases = new Set<string>(
    serviceOperationsWithBaseAliases.flatMap(({ operations }) =>
      operations.map(({ baseAlias }) => baseAlias)
    )
  );

  const usedAliases = new Set<string>([
    'Services',
    'services',
    ...reservedBindingNames,
    ...services.map((service) => service.typeName),
  ]);

  // Pass 2: allocate guaranteed-unique aliases across all services without colliding
  // with existing aliases or another operation's natural base alias.
  return serviceOperationsWithBaseAliases.map(({ service, operations }) => ({
    service,
    operations: operations.map(
      ({ operationName, exportedVariableName, baseAlias }) => {
        let alias = baseAlias;

        if (usedAliases.has(alias)) {
          let suffix = 2;
          do {
            alias = `${baseAlias}_${suffix++}`;
          } while (usedAliases.has(alias) || allBaseAliases.has(alias));
        }

        usedAliases.add(alias);

        return {
          operationName,
          exportedVariableName,
          alias,
        };
      }
    ),
  }));
}

function sanitizeIdentifierPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_$]+/g, '_').replace(/^_+|_+$/g, '');
}

function createBaseOperationAlias(
  serviceName: string,
  operationName: string
): string {
  const servicePart = sanitizeIdentifierPart(serviceName) || 'service';
  const operationPart = sanitizeIdentifierPart(operationName) || 'operation';
  const combined = `${servicePart}_${operationPart}`;

  return /^[0-9]/.test(combined) ? `_${combined}` : combined;
}
