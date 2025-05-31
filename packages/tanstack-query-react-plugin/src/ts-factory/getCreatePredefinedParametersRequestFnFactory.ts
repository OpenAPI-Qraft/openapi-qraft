import type { OverrideImportType } from './OverrideImportType.js';
import { PredefinedParametersGlob } from '@openapi-qraft/plugin/lib/predefineSchemaParameters';
import ts from 'typescript';
import { maybeResolveImport } from '../lib/maybeResolveImport.js';
import { getOverriddenImportDeclarationsFactory } from './getOverriddenImportDeclarationsFactory.js';

type Options = {
  servicesDirName: string;
  operationPredefinedParameters: Array<PredefinedParametersGlob> | undefined;
  openapiTypesImportPath: string | undefined;
  importTypeOverrides: OverrideImportType[keyof OverrideImportType] | undefined;
};

export const getCreatePredefinedParametersRequestFnFactory = (
  options: Options
) => {
  if (!options.openapiTypesImportPath) return [];
  if (!options.operationPredefinedParameters?.length) return [];

  return [
    ...getCreatePredefinedParametersRequestFnImportsFactory(options),
    ...getCreatePredefinedParametersRequestFnTypesFactory(options),
    ...getCreatePredefinedParametersRequestFnVariablesFactory(options),
    ...getCreatePredefinedParametersRequestFnFunctionFactory(options),
  ];
};

const getCreatePredefinedParametersRequestFnImportsFactory = ({
  servicesDirName,
  openapiTypesImportPath,
  importTypeOverrides,
}: Options) => {
  if (!openapiTypesImportPath) return [];

  const factory = ts.factory;

  const qraftImports = {
    '@openapi-qraft/react': ['RequestFn'],
    '@openapi-qraft/react/qraftPredefinedParametersRequestFn': [
      'QraftPredefinedParameterValue',
    ],
  };

  const internalImports = Object.entries(qraftImports)
    .map(([importPath, typeNames]) => {
      const importSpecifiers = typeNames
        .filter((typeName) => !importTypeOverrides?.[importPath]?.[typeName])
        .map((typeName) =>
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier(typeName)
          )
        );

      if (!importSpecifiers.length) return null;

      return factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          true,
          undefined,
          factory.createNamedImports(importSpecifiers)
        ),
        factory.createStringLiteral(importPath),
        undefined
      );
    })
    .filter((importDeclaration) => !!importDeclaration);

  const overrideImports = importTypeOverrides
    ? getOverriddenImportDeclarationsFactory(qraftImports, importTypeOverrides)
    : [];

  return [
    ...internalImports,
    ...overrideImports,
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamedImports([
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier('qraftPredefinedParametersRequestFn')
          ),
        ])
      ),
      factory.createStringLiteral(
        '@openapi-qraft/react/qraftPredefinedParametersRequestFn'
      ),
      undefined
    ),
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        true,
        undefined,
        factory.createNamedImports([
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier('paths')
          ),
        ])
      ),
      factory.createStringLiteral(
        maybeResolveImport({ openapiTypesImportPath, servicesDirName })
      ),
      undefined
    ),
  ];
};

const getCreatePredefinedParametersRequestFnTypesFactory = ({
  operationPredefinedParameters,
}: Options) => {
  if (!operationPredefinedParameters) return [];

  const factory = ts.factory;

  return [
    factory.createTypeAliasDeclaration(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      factory.createIdentifier('ServiceOperationsPredefinedParameters'),
      undefined,
      factory.createTupleTypeNode(
        operationPredefinedParameters.map((item) => {
          return factory.createTypeLiteralNode([
            factory.createPropertySignature(
              undefined,
              factory.createIdentifier('requestPattern'),
              undefined,
              factory.createLiteralTypeNode(
                factory.createStringLiteral(
                  `${item.methods.join(',')} ${item.pathGlobs}`
                )
              )
            ),
            factory.createPropertySignature(
              undefined,
              factory.createIdentifier('parameters'),
              undefined,
              factory.createTupleTypeNode(
                item.parameters.map((parameter) =>
                  factory.createTypeLiteralNode([
                    factory.createPropertySignature(
                      undefined,
                      factory.createIdentifier('in'),
                      undefined,
                      factory.createLiteralTypeNode(
                        factory.createStringLiteral(parameter.in)
                      )
                    ),
                    factory.createPropertySignature(
                      undefined,
                      factory.createIdentifier('name'),
                      undefined,
                      factory.createLiteralTypeNode(
                        factory.createStringLiteral(parameter.name)
                      )
                    ),
                    factory.createPropertySignature(
                      undefined,
                      factory.createIdentifier('value'),
                      undefined,
                      factory.createTypeReferenceNode(
                        factory.createIdentifier(
                          'QraftPredefinedParameterValue'
                        ),
                        [
                          factory.createIndexedAccessTypeNode(
                            factory.createTypeReferenceNode(
                              factory.createIdentifier('NonNullable'),
                              [
                                factory.createIndexedAccessTypeNode(
                                  factory.createIndexedAccessTypeNode(
                                    factory.createIndexedAccessTypeNode(
                                      factory.createIndexedAccessTypeNode(
                                        factory.createTypeReferenceNode(
                                          factory.createIdentifier('paths'),
                                          undefined
                                        ),
                                        factory.createLiteralTypeNode(
                                          factory.createStringLiteral(
                                            item.paths[0]
                                          )
                                        )
                                      ),
                                      factory.createLiteralTypeNode(
                                        factory.createStringLiteral(
                                          item.methods ? item.methods[0] : 'get'
                                        )
                                      )
                                    ),
                                    factory.createLiteralTypeNode(
                                      factory.createStringLiteral('parameters')
                                    )
                                  ),
                                  factory.createLiteralTypeNode(
                                    factory.createStringLiteral(parameter.in)
                                  )
                                ),
                              ]
                            ),
                            factory.createLiteralTypeNode(
                              factory.createStringLiteral(parameter.name)
                            )
                          ),
                        ]
                      )
                    ),
                  ])
                )
              )
            ),
          ]);
        })
      )
    ),
  ];
};
const getCreatePredefinedParametersRequestFnVariablesFactory = ({
  operationPredefinedParameters,
}: Options) => {
  if (!operationPredefinedParameters) return [];

  const factory = ts.factory;

  return [
    factory.createVariableStatement(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier('serviceOperationsPredefinedParameters'),
            undefined,
            undefined,
            factory.createAsExpression(
              factory.createArrayLiteralExpression(
                operationPredefinedParameters.map((item) =>
                  factory.createObjectLiteralExpression(
                    [
                      factory.createPropertyAssignment(
                        factory.createIdentifier('requestPattern'),
                        factory.createStringLiteral(
                          `${item.methods.join(',')} ${item.pathGlobs}`
                        )
                      ),
                      factory.createPropertyAssignment(
                        factory.createIdentifier('methods'),
                        factory.createArrayLiteralExpression(
                          item.methods.map((method) =>
                            factory.createStringLiteral(method)
                          ),
                          false
                        )
                      ),
                      factory.createPropertyAssignment(
                        factory.createIdentifier('paths'),
                        factory.createArrayLiteralExpression(
                          item.paths.map((path) =>
                            factory.createStringLiteral(path)
                          ),
                          true
                        )
                      ),
                    ],
                    true
                  )
                ),
                true
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier('const'),
                undefined
              )
            )
          ),
        ],
        ts.NodeFlags.Const
      )
    ),
  ];
};

const getCreatePredefinedParametersRequestFnFunctionFactory = ({
  operationPredefinedParameters,
}: Options) => {
  if (!operationPredefinedParameters) return [];

  const factory = ts.factory;

  return [
    factory.createFunctionDeclaration(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier('createPredefinedParametersRequestFn'),
      [
        factory.createTypeParameterDeclaration(
          undefined,
          factory.createIdentifier('TRequestFn'),
          factory.createTypeReferenceNode(
            factory.createIdentifier('RequestFn'),
            [
              factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
              factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
            ]
          ),
          undefined
        ),
      ],
      [
        factory.createParameterDeclaration(
          undefined,
          undefined,
          factory.createIdentifier('predefinedParameters'),
          undefined,
          factory.createTypeReferenceNode(
            factory.createIdentifier('ServiceOperationsPredefinedParameters'),
            undefined
          ),
          undefined
        ),
        factory.createParameterDeclaration(
          undefined,
          undefined,
          factory.createIdentifier('requestFn'),
          undefined,
          factory.createTypeReferenceNode(
            factory.createIdentifier('TRequestFn'),
            undefined
          ),
          undefined
        ),
      ],
      factory.createTypeReferenceNode(
        factory.createIdentifier('TRequestFn'),
        undefined
      ),
      factory.createBlock(
        [
          factory.createReturnStatement(
            factory.createAsExpression(
              factory.createCallExpression(
                factory.createIdentifier('qraftPredefinedParametersRequestFn'),
                undefined,
                [
                  factory.createIdentifier('predefinedParameters'),
                  factory.createIdentifier(
                    'serviceOperationsPredefinedParameters'
                  ),
                  factory.createIdentifier('requestFn'),
                ]
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier('TRequestFn'),
                undefined
              )
            )
          ),
        ],
        true
      )
    ),
  ];
};
