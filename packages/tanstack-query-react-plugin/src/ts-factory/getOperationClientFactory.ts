import ts from 'typescript';

type Options = {
  servicesDirName: string;
  explicitImportExtensions: '.js' | '.ts' | undefined;
  defaultClientCallbacks: string[] | ['all'] | ['none'] | undefined;
  defaultClientServices: string[] | ['all'] | ['none'] | undefined;
  createAPIClientFnName: string;
};

export const getOperationClientFactory = (options: Options) => {
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

  const imports: ts.Statement[] = [
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        true,
        undefined,
        factory.createNamedImports(
          [
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier('APIBasicClientServices')
            ),
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier('APIBasicQueryClientServices')
            ),
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier('APIDefaultQueryClientServices')
            ),
            shouldImportAllCallbacks
              ? null
              : factory.createImportSpecifier(
                  false,
                  undefined,
                  factory.createIdentifier('APIQueryClientServices')
                ),
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier('APIUtilityClientServices')
            ),
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier('CreateAPIBasicClientOptions')
            ),
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier('CreateAPIBasicQueryClientOptions')
            ),
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier('CreateAPIClientOptions')
            ),
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier('CreateAPIQueryClientOptions')
            ),
            shouldImportAllServices
              ? null
              : factory.createImportSpecifier(
                  false,
                  undefined,
                  factory.createIdentifier('UnionServiceOperationsDeclaration')
                ),
          ].filter(nonNullable)
        )
      ),
      factory.createStringLiteral('@openapi-qraft/react'),
      undefined
    ),
  ];

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
              shouldImportAllCallbacks ? 'AllCallbacks' : 'DefaultCallbacks'
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
              shouldImportAllCallbacks ? 'AllCallbacks' : 'DefaultCallbacks'
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
          factory.createTypeReferenceNode(
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
            factory.createPrefixUnaryExpression(
              ts.SyntaxKind.ExclamationToken,
              factory.createIdentifier(
                shouldImportAllCallbacks ? 'options' : 'callbacksOrOptions'
              )
            ),
            factory.createReturnStatement(
              factory.createCallExpression(
                factory.createIdentifier('qraftAPIClient'),
                undefined,
                [
                  factory.createIdentifier('services'),
                  factory.createIdentifier(
                    shouldImportAllCallbacks ? 'allCallbacks' : 'callbacks'
                  ),
                ]
              )
            ),
            undefined
          ),
          factory.createIfStatement(
            factory.createBinaryExpression(
              factory.createStringLiteral('requestFn'),
              factory.createToken(ts.SyntaxKind.InKeyword),
              factory.createIdentifier(
                shouldImportAllCallbacks ? 'options' : 'callbacksOrOptions'
              )
            ),
            factory.createReturnStatement(
              factory.createCallExpression(
                factory.createIdentifier('qraftAPIClient'),
                undefined,
                [
                  factory.createIdentifier('services'),
                  factory.createIdentifier(
                    shouldImportAllCallbacks ? 'allCallbacks' : 'callbacks'
                  ),
                  factory.createIdentifier(
                    shouldImportAllCallbacks ? 'options' : 'callbacksOrOptions'
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
                shouldImportAllCallbacks ? 'options' : 'callbacksOrOptions'
              )
            ),
            factory.createReturnStatement(
              factory.createCallExpression(
                factory.createIdentifier('qraftAPIClient'),
                undefined,
                [
                  factory.createIdentifier('services'),
                  factory.createIdentifier(
                    shouldImportAllCallbacks ? 'allCallbacks' : 'callbacks'
                  ),
                  factory.createIdentifier(
                    shouldImportAllCallbacks ? 'options' : 'callbacksOrOptions'
                  ),
                ]
              )
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
                      factory.createIdentifier(
                        shouldImportAllCallbacks ? 'allCallbacks' : 'callbacks'
                      )
                    ),
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
