import type { OverrideImportType } from './OverrideImportType.js';
import ts from 'typescript';
import { getOverriddenImportDeclarationsFactory } from './getOverriddenImportDeclarationsFactory.js';

type Options = {
  servicesDirName: string;
  explicitImportExtensions: '.js' | '.ts' | undefined;
  defaultClientCallbacks: string[] | ['all'] | ['none'] | undefined;
  defaultClientServices: string[] | ['all'] | ['none'] | undefined;
  createAPIClientFnName: string;
  createAPIClientFnImportTypeOverrides:
    | OverrideImportType[keyof OverrideImportType]
    | undefined;
  contextName: string | undefined;
};

export const getCreateAPIClientFactory = (options: Options) => {
  return [
    ...getOperationClientImportsFactory(options),
    ...getCreateOperationClientFunctionFactory(options),
  ];
};

const getOperationClientImportsFactory = ({
  servicesDirName,
  explicitImportExtensions,
  defaultClientCallbacks,
  defaultClientServices,
  createAPIClientFnImportTypeOverrides,
  contextName,
}: Options) => {
  const factory = ts.factory;

  const shouldImportAllCallbacks = defaultClientCallbacks?.some(
    (name) => name === 'all'
  );
  const shouldImportAllServices = defaultClientServices?.some(
    (name) => name === 'all'
  );

  const clientCallbacks =
    defaultClientCallbacks?.filter(
      (name) => name !== 'all' && name !== 'none'
    ) || [];

  const qraftImportTypeOverrides =
    createAPIClientFnImportTypeOverrides?.['@openapi-qraft/react'];

  const availableQraftImportedTypes = [
    'APIBasicClientServices',
    'APIBasicQueryClientServices',
    'APIDefaultQueryClientServices',
    contextName && 'APIContextQueryClientServices',
    !shouldImportAllCallbacks && 'APIQueryClientServices',
    !contextName && 'APIUtilityClientServices',
    'CreateAPIBasicClientOptions',
    'CreateAPIBasicQueryClientOptions',
    'CreateAPIClientOptions',
    'CreateAPIQueryClientOptions',
    !shouldImportAllServices && 'UnionServiceOperationsDeclaration',
  ].filter((typeName) => typeof typeName === 'string');

  const imports: ts.Statement[] = [];

  const qraftTypesToImport = availableQraftImportedTypes.filter(
    (typeName) => !qraftImportTypeOverrides?.[typeName]
  );

  if (qraftTypesToImport.length) {
    imports.push(
      factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          true,
          undefined,
          factory.createNamedImports(
            qraftTypesToImport.map((name) =>
              factory.createImportSpecifier(
                false,
                undefined,
                factory.createIdentifier(name)
              )
            )
          )
        ),
        factory.createStringLiteral('@openapi-qraft/react'),
        undefined
      )
    );
  }

  if (qraftImportTypeOverrides) {
    imports.push(
      ...getOverriddenImportDeclarationsFactory(
        { '@openapi-qraft/react': availableQraftImportedTypes },
        createAPIClientFnImportTypeOverrides
      )
    );
  }

  if (contextName) {
    imports.push(
      factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          false,
          undefined,
          factory.createNamedImports([
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier(contextName)
            ),
          ])
        ),
        factory.createStringLiteral(
          `./${contextName}${explicitImportExtensions ?? ''}`
        ),
        undefined
      )
    );
  }

  imports.push(
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        !shouldImportAllCallbacks,
        undefined,
        factory.createNamespaceImport(factory.createIdentifier('allCallbacks'))
      ),
      factory.createStringLiteral('@openapi-qraft/react/callbacks/index'),
      undefined
    )
  );

  imports.push(
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamedImports([
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier('qraftAPIClient')
          ),
        ])
      ),
      factory.createStringLiteral('@openapi-qraft/react'),
      undefined
    )
  );

  if (!shouldImportAllCallbacks && clientCallbacks.length) {
    imports.push(
      factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          false,
          undefined,
          factory.createNamedImports(
            clientCallbacks.map((name) =>
              factory.createImportSpecifier(
                false,
                undefined,
                factory.createIdentifier(name)
              )
            )
          )
        ),
        factory.createStringLiteral('@openapi-qraft/react/callbacks/index'),
        undefined
      )
    );
  }

  if (!shouldImportAllCallbacks) {
    imports.push(
      factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
          [
            factory.createVariableDeclaration(
              factory.createIdentifier('defaultCallbacks'),
              undefined,
              undefined,
              factory.createAsExpression(
                factory.createObjectLiteralExpression(
                  clientCallbacks.map((name) =>
                    factory.createShorthandPropertyAssignment(
                      factory.createIdentifier(name),
                      undefined
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
      )
    );
  }

  if (shouldImportAllServices) {
    imports.push(
      factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          false,
          undefined,
          factory.createNamedImports([
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier('services')
            ),
          ])
        ),
        factory.createStringLiteral(
          `./${servicesDirName}/index${explicitImportExtensions ?? ''}`
        ),
        undefined
      )
    );
  }

  return imports;
};

const getCreateOperationClientFunctionFactory = ({
  defaultClientCallbacks,
  defaultClientServices,
  createAPIClientFnName,
  contextName,
}: Options) => {
  const factory = ts.factory;

  const shouldImportAllCallbacks = defaultClientCallbacks?.some(
    (name) => name === 'all'
  );
  const shouldImportAllServices = defaultClientServices?.some(
    (name) => name === 'all'
  );

  const clientCallbacks =
    defaultClientCallbacks?.filter(
      (name) => name !== 'all' && name !== 'none'
    ) || [];

  return [
    factory.createFunctionDeclaration(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier(createAPIClientFnName),
      [
        shouldImportAllServices
          ? null
          : factory.createTypeParameterDeclaration(
              undefined,
              factory.createIdentifier('Services'),
              factory.createTypeReferenceNode(
                factory.createIdentifier('UnionServiceOperationsDeclaration'),
                [
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('Services'),
                    undefined
                  ),
                ]
              ),
              undefined
            ),
      ].filter(nonNullable),
      [
        shouldImportAllServices
          ? null
          : factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('services'),
              undefined,
              factory.createTypeReferenceNode(
                factory.createIdentifier('Services'),
                undefined
              ),
              undefined
            ),
        factory.createParameterDeclaration(
          undefined,
          undefined,
          factory.createIdentifier('options'),
          undefined,
          factory.createTypeReferenceNode(
            factory.createIdentifier('CreateAPIQueryClientOptions'),
            undefined
          ),
          undefined
        ),
        shouldImportAllCallbacks
          ? null
          : factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('callbacks'),
              shouldImportAllCallbacks
                ? factory.createToken(ts.SyntaxKind.QuestionToken)
                : undefined,
              factory.createTypeReferenceNode(
                factory.createIdentifier('AllCallbacks'),
                undefined
              ),
              undefined
            ),
      ].filter(nonNullable),
      factory.createTypeReferenceNode(
        factory.createIdentifier('APIDefaultQueryClientServices'),
        [
          factory.createTypeReferenceNode(
            factory.createIdentifier('Services'),
            undefined
          ),
        ]
      ),
      undefined
    ),
    shouldImportAllCallbacks
      ? null
      : factory.createFunctionDeclaration(
          [factory.createToken(ts.SyntaxKind.ExportKeyword)],
          undefined,
          factory.createIdentifier(createAPIClientFnName),
          [
            shouldImportAllServices
              ? null
              : factory.createTypeParameterDeclaration(
                  undefined,
                  factory.createIdentifier('Services'),
                  factory.createTypeReferenceNode(
                    factory.createIdentifier(
                      'UnionServiceOperationsDeclaration'
                    ),
                    [
                      factory.createTypeReferenceNode(
                        factory.createIdentifier('Services'),
                        undefined
                      ),
                    ]
                  ),
                  undefined
                ),
            factory.createTypeParameterDeclaration(
              undefined,
              factory.createIdentifier('Callbacks'),
              factory.createTypeReferenceNode(
                factory.createIdentifier('Partial'),
                [
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('AllCallbacks'),
                    undefined
                  ),
                ]
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier(
                  shouldImportAllCallbacks ? 'AllCallbacks' : 'DefaultCallbacks'
                ),
                undefined
              )
            ),
          ].filter(nonNullable),
          [
            shouldImportAllServices
              ? null
              : factory.createParameterDeclaration(
                  undefined,
                  undefined,
                  factory.createIdentifier('services'),
                  undefined,
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('Services'),
                    undefined
                  ),
                  undefined
                ),
            factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('options'),
              undefined,
              factory.createTypeReferenceNode(
                factory.createIdentifier('CreateAPIQueryClientOptions'),
                undefined
              ),
              undefined
            ),
            factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('callbacks'),
              shouldImportAllCallbacks || clientCallbacks.length
                ? factory.createToken(ts.SyntaxKind.QuestionToken)
                : undefined,
              factory.createTypeReferenceNode(
                factory.createIdentifier('Callbacks'),
                undefined
              ),
              undefined
            ),
          ].filter(nonNullable),
          factory.createTypeReferenceNode(
            factory.createIdentifier('APIQueryClientServices'),
            [
              factory.createTypeReferenceNode(
                factory.createIdentifier('Services'),
                undefined
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier('Callbacks'),
                undefined
              ),
            ]
          ),
          undefined
        ),
    factory.createFunctionDeclaration(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier(createAPIClientFnName),
      [
        shouldImportAllServices
          ? null
          : factory.createTypeParameterDeclaration(
              undefined,
              factory.createIdentifier('Services'),
              factory.createTypeReferenceNode(
                factory.createIdentifier('UnionServiceOperationsDeclaration'),
                [
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('Services'),
                    undefined
                  ),
                ]
              ),
              undefined
            ),
        shouldImportAllCallbacks
          ? null
          : factory.createTypeParameterDeclaration(
              undefined,
              factory.createIdentifier('Callbacks'),
              factory.createTypeReferenceNode(
                factory.createIdentifier('Partial'),
                [
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('AllCallbacks'),
                    undefined
                  ),
                ]
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier(
                  shouldImportAllCallbacks ? 'AllCallbacks' : 'DefaultCallbacks'
                ),
                undefined
              )
            ),
      ].filter(nonNullable),
      [
        shouldImportAllServices
          ? null
          : factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('services'),
              undefined,
              factory.createTypeReferenceNode(
                factory.createIdentifier('Services'),
                undefined
              ),
              undefined
            ),
        factory.createParameterDeclaration(
          undefined,
          undefined,
          factory.createIdentifier('options'),
          undefined,
          factory.createTypeReferenceNode(
            factory.createIdentifier('CreateAPIBasicQueryClientOptions'),
            undefined
          ),
          undefined
        ),
        shouldImportAllCallbacks
          ? null
          : factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('callbacks'),
              shouldImportAllCallbacks || clientCallbacks.length
                ? factory.createToken(ts.SyntaxKind.QuestionToken)
                : undefined,
              factory.createTypeReferenceNode(
                factory.createIdentifier('Callbacks'),
                undefined
              ),
              undefined
            ),
      ].filter(nonNullable),
      factory.createTypeReferenceNode(
        factory.createIdentifier('APIBasicQueryClientServices'),
        [
          factory.createTypeReferenceNode(
            factory.createIdentifier('Services'),
            undefined
          ),
          factory.createTypeReferenceNode(
            factory.createIdentifier(
              shouldImportAllCallbacks ? 'AllCallbacks' : 'Callbacks'
            ),
            undefined
          ),
        ]
      ),
      undefined
    ),
    factory.createFunctionDeclaration(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier(createAPIClientFnName),
      [
        shouldImportAllServices
          ? null
          : factory.createTypeParameterDeclaration(
              undefined,
              factory.createIdentifier('Services'),
              factory.createTypeReferenceNode(
                factory.createIdentifier('UnionServiceOperationsDeclaration'),
                [
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('Services'),
                    undefined
                  ),
                ]
              ),
              undefined
            ),
        shouldImportAllCallbacks
          ? null
          : factory.createTypeParameterDeclaration(
              undefined,
              factory.createIdentifier('Callbacks'),
              factory.createTypeReferenceNode(
                factory.createIdentifier('Partial'),
                [
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('AllCallbacks'),
                    undefined
                  ),
                ]
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier(
                  shouldImportAllCallbacks ? 'AllCallbacks' : 'DefaultCallbacks'
                ),
                undefined
              )
            ),
      ].filter(nonNullable),
      [
        shouldImportAllServices
          ? null
          : factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('services'),
              undefined,
              factory.createTypeReferenceNode(
                factory.createIdentifier('Services'),
                undefined
              ),
              undefined
            ),
        factory.createParameterDeclaration(
          undefined,
          undefined,
          factory.createIdentifier('options'),
          undefined,
          factory.createTypeReferenceNode(
            factory.createIdentifier('CreateAPIBasicClientOptions'),
            undefined
          ),
          undefined
        ),
        shouldImportAllCallbacks
          ? null
          : factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('callbacks'),
              shouldImportAllCallbacks || clientCallbacks.length
                ? factory.createToken(ts.SyntaxKind.QuestionToken)
                : undefined,
              factory.createTypeReferenceNode(
                factory.createIdentifier('Callbacks'),
                undefined
              ),
              undefined
            ),
      ].filter(nonNullable),
      factory.createTypeReferenceNode(
        factory.createIdentifier('APIBasicClientServices'),
        [
          factory.createTypeReferenceNode(
            factory.createIdentifier('Services'),
            undefined
          ),
          factory.createTypeReferenceNode(
            factory.createIdentifier(
              shouldImportAllCallbacks ? 'AllCallbacks' : 'Callbacks'
            ),
            undefined
          ),
        ]
      ),
      undefined
    ),
    factory.createFunctionDeclaration(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier(createAPIClientFnName),
      [
        shouldImportAllServices
          ? null
          : factory.createTypeParameterDeclaration(
              undefined,
              factory.createIdentifier('Services'),
              factory.createTypeReferenceNode(
                factory.createIdentifier('UnionServiceOperationsDeclaration'),
                [
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('Services'),
                    undefined
                  ),
                ]
              ),
              undefined
            ),
        shouldImportAllCallbacks
          ? null
          : factory.createTypeParameterDeclaration(
              undefined,
              factory.createIdentifier('Callbacks'),
              factory.createTypeReferenceNode(
                factory.createIdentifier('Partial'),
                [
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('AllCallbacks'),
                    undefined
                  ),
                ]
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier(
                  shouldImportAllCallbacks ? 'AllCallbacks' : 'DefaultCallbacks'
                ),
                undefined
              )
            ),
      ].filter(nonNullable),
      [
        shouldImportAllServices
          ? null
          : factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('services'),
              undefined,
              factory.createTypeReferenceNode(
                factory.createIdentifier('Services'),
                undefined
              ),
              undefined
            ),
        shouldImportAllCallbacks
          ? null
          : factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('callbacks'),
              shouldImportAllCallbacks || clientCallbacks.length
                ? factory.createToken(ts.SyntaxKind.QuestionToken)
                : undefined,
              factory.createTypeReferenceNode(
                factory.createIdentifier('Callbacks'),
                undefined
              ),
              undefined
            ),
      ].filter(nonNullable),
      factory.createTypeReferenceNode(
        factory.createIdentifier(
          contextName
            ? 'APIContextQueryClientServices'
            : 'APIUtilityClientServices'
        ),
        [
          factory.createTypeReferenceNode(
            factory.createIdentifier('Services'),
            undefined
          ),
          factory.createTypeReferenceNode(
            factory.createIdentifier(
              shouldImportAllCallbacks ? 'AllCallbacks' : 'Callbacks'
            ),
            undefined
          ),
        ]
      ),
      undefined
    ),
    factory.createFunctionDeclaration(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier(createAPIClientFnName),
      [
        shouldImportAllServices
          ? null
          : factory.createTypeParameterDeclaration(
              undefined,
              factory.createIdentifier('Services'),
              factory.createTypeReferenceNode(
                factory.createIdentifier('UnionServiceOperationsDeclaration'),
                [
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('Services'),
                    undefined
                  ),
                ]
              ),
              undefined
            ),
        shouldImportAllCallbacks
          ? null
          : factory.createTypeParameterDeclaration(
              undefined,
              factory.createIdentifier('Callbacks'),
              factory.createTypeReferenceNode(
                factory.createIdentifier('Partial'),
                [
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('AllCallbacks'),
                    undefined
                  ),
                ]
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier(
                  shouldImportAllCallbacks ? 'AllCallbacks' : 'DefaultCallbacks'
                ),
                undefined
              )
            ),
      ].filter(nonNullable),
      [
        shouldImportAllServices
          ? null
          : factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('services'),
              undefined,
              factory.createTypeReferenceNode(
                factory.createIdentifier('Services'),
                undefined
              ),
              undefined
            ),
        factory.createParameterDeclaration(
          undefined,
          undefined,
          factory.createIdentifier(
            shouldImportAllCallbacks ? 'options' : 'callbacksOrOptions'
          ),
          shouldImportAllCallbacks || clientCallbacks.length
            ? factory.createToken(ts.SyntaxKind.QuestionToken)
            : undefined,
          factory.createUnionTypeNode(
            [
              factory.createTypeReferenceNode(
                factory.createIdentifier('CreateAPIClientOptions'),
                undefined
              ),
              shouldImportAllCallbacks
                ? null
                : factory.createTypeReferenceNode(
                    factory.createIdentifier('Callbacks'),
                    undefined
                  ),
            ].filter(nonNullable)
          )
        ),
        shouldImportAllCallbacks
          ? null
          : factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('callbacks'),
              undefined,
              factory.createTypeReferenceNode(
                factory.createIdentifier('Callbacks'),
                undefined
              ),
              factory.createAsExpression(
                factory.createIdentifier(
                  shouldImportAllCallbacks ? 'allCallbacks' : 'defaultCallbacks'
                ),
                factory.createTypeReferenceNode(
                  factory.createIdentifier('Callbacks'),
                  undefined
                )
              )
            ),
      ].filter(nonNullable),
      factory.createUnionTypeNode(
        [
          factory.createTypeReferenceNode(
            factory.createIdentifier('APIDefaultQueryClientServices'),
            [
              factory.createTypeReferenceNode(
                factory.createIdentifier('Services'),
                undefined
              ),
            ]
          ),
          shouldImportAllCallbacks
            ? null
            : factory.createTypeReferenceNode(
                factory.createIdentifier('APIQueryClientServices'),
                [
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('Services'),
                    undefined
                  ),
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('Callbacks'),
                    undefined
                  ),
                ]
              ),
          contextName
            ? factory.createTypeReferenceNode(
                factory.createIdentifier('APIContextQueryClientServices'),
                [
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('Services'),
                    undefined
                  ),
                  factory.createTypeReferenceNode(
                    factory.createIdentifier(
                      shouldImportAllCallbacks ? 'AllCallbacks' : 'Callbacks'
                    ),
                    undefined
                  ),
                ]
              )
            : null,
          factory.createTypeReferenceNode(
            factory.createIdentifier('APIBasicQueryClientServices'),
            [
              factory.createTypeReferenceNode(
                factory.createIdentifier('Services'),
                undefined
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier(
                  shouldImportAllCallbacks ? 'AllCallbacks' : 'Callbacks'
                ),
                undefined
              ),
            ]
          ),
          factory.createTypeReferenceNode(
            factory.createIdentifier('APIBasicClientServices'),
            [
              factory.createTypeReferenceNode(
                factory.createIdentifier('Services'),
                undefined
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier(
                  shouldImportAllCallbacks ? 'AllCallbacks' : 'Callbacks'
                ),
                undefined
              ),
            ]
          ),
          contextName
            ? null
            : factory.createTypeReferenceNode(
                factory.createIdentifier('APIUtilityClientServices'),
                [
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('Services'),
                    undefined
                  ),
                  factory.createTypeReferenceNode(
                    factory.createIdentifier(
                      shouldImportAllCallbacks ? 'AllCallbacks' : 'Callbacks'
                    ),
                    undefined
                  ),
                ]
              ),
        ].filter(nonNullable)
      ),
      factory.createBlock(
        [
          factory.createIfStatement(
            factory.createIdentifier(
              shouldImportAllCallbacks ? 'options' : 'callbacksOrOptions'
            ),
            factory.createBlock(
              [
                factory.createIfStatement(
                  factory.createBinaryExpression(
                    factory.createStringLiteral('requestFn'),
                    factory.createToken(ts.SyntaxKind.InKeyword),
                    factory.createIdentifier(
                      shouldImportAllCallbacks
                        ? 'options'
                        : 'callbacksOrOptions'
                    )
                  ),
                  factory.createReturnStatement(
                    factory.createCallExpression(
                      factory.createIdentifier('qraftAPIClient'),
                      undefined,
                      [
                        factory.createIdentifier('services'),
                        factory.createIdentifier(
                          shouldImportAllCallbacks
                            ? 'allCallbacks'
                            : 'callbacks'
                        ),
                        factory.createIdentifier(
                          shouldImportAllCallbacks
                            ? 'options'
                            : 'callbacksOrOptions'
                        ),
                      ]
                    )
                  ),
                  undefined
                ),
                factory.createIfStatement(
                  factory.createBinaryExpression(
                    factory.createStringLiteral('queryClient'),
                    factory.createToken(ts.SyntaxKind.InKeyword),
                    factory.createIdentifier(
                      shouldImportAllCallbacks
                        ? 'options'
                        : 'callbacksOrOptions'
                    )
                  ),
                  factory.createReturnStatement(
                    factory.createCallExpression(
                      factory.createIdentifier('qraftAPIClient'),
                      undefined,
                      [
                        factory.createIdentifier('services'),
                        factory.createIdentifier(
                          shouldImportAllCallbacks
                            ? 'allCallbacks'
                            : 'callbacks'
                        ),
                        factory.createIdentifier(
                          shouldImportAllCallbacks
                            ? 'options'
                            : 'callbacksOrOptions'
                        ),
                      ]
                    )
                  ),
                  undefined
                ),
              ],
              true
            ),
            undefined
          ),
          factory.createReturnStatement(
            factory.createCallExpression(
              factory.createIdentifier('qraftAPIClient'),
              undefined,
              [
                factory.createIdentifier('services'),
                shouldImportAllCallbacks
                  ? factory.createIdentifier('allCallbacks')
                  : factory.createBinaryExpression(
                      factory.createIdentifier('callbacksOrOptions'),
                      factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                      factory.createIdentifier('callbacks')
                    ),
                ...(contextName ? [factory.createIdentifier(contextName)] : []),
              ]
            )
          ),
        ],
        true
      )
    ),
    shouldImportAllCallbacks
      ? null
      : factory.createTypeAliasDeclaration(
          undefined,
          factory.createIdentifier('DefaultCallbacks'),
          undefined,
          factory.createTypeQueryNode(
            factory.createIdentifier('defaultCallbacks'),
            undefined
          )
        ),
    factory.createTypeAliasDeclaration(
      undefined,
      factory.createIdentifier('AllCallbacks'),
      undefined,
      factory.createTypeQueryNode(
        factory.createIdentifier('allCallbacks'),
        undefined
      )
    ),
    shouldImportAllServices
      ? factory.createTypeAliasDeclaration(
          undefined,
          factory.createIdentifier('Services'),
          undefined,
          factory.createTypeQueryNode(
            factory.createIdentifier('services'),
            undefined
          )
        )
      : null,
  ].filter(nonNullable);
};

function nonNullable<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
