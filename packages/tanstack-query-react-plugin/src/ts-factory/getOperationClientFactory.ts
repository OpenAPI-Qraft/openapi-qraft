import ts from 'typescript';

export const getOperationClientFactory = () => {
  return [
    ...getOperationClientImportsFactory(),
    ...getCreateOperationClientFunctionFactory(),
  ];
};

const getOperationClientImportsFactory = () => {
  const factory = ts.factory;

  return [
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        true,
        undefined,
        factory.createNamedImports([
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
          factory.createImportSpecifier(
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
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier('UnionServiceOperationsDeclaration')
          ),
        ])
      ),
      factory.createStringLiteral('@openapi-qraft/react'),
      undefined
    ),
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        true,
        undefined,
        factory.createNamespaceImport(factory.createIdentifier('allCallbacks'))
      ),
      factory.createStringLiteral('@openapi-qraft/react/callbacks/index'),
      undefined
    ),
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
    ),
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamedImports([
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier('cancelQueries')
          ),
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier('ensureInfiniteQueryData')
          ),
        ])
      ),
      factory.createStringLiteral('@openapi-qraft/react/callbacks/index'),
      undefined
    ),
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
                [
                  factory.createShorthandPropertyAssignment(
                    factory.createIdentifier('cancelQueries'),
                    undefined
                  ),
                  factory.createShorthandPropertyAssignment(
                    factory.createIdentifier('ensureInfiniteQueryData'),
                    undefined
                  ),
                ],
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

const getCreateOperationClientFunctionFactory = () => {
  const factory = ts.factory;

  return [
    factory.createFunctionDeclaration(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier('createAPIOperationClient'),
      [
        factory.createTypeParameterDeclaration(
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
        factory.createTypeParameterDeclaration(
          undefined,
          factory.createIdentifier('Callbacks'),
          factory.createTypeReferenceNode(
            factory.createIdentifier('AllCallbacks'),
            undefined
          ),
          undefined
        ),
      ],
      [
        factory.createParameterDeclaration(
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
          undefined,
          factory.createTypeReferenceNode(
            factory.createIdentifier('Callbacks'),
            undefined
          ),
          undefined
        ),
      ],
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
    factory.createFunctionDeclaration(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier('createAPIOperationClient'),
      [
        factory.createTypeParameterDeclaration(
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
        factory.createTypeParameterDeclaration(
          undefined,
          factory.createIdentifier('Callbacks'),
          factory.createTypeReferenceNode(factory.createIdentifier('Partial'), [
            factory.createTypeReferenceNode(
              factory.createIdentifier('AllCallbacks'),
              undefined
            ),
          ]),
          factory.createTypeReferenceNode(
            factory.createIdentifier('DefaultCallbacks'),
            undefined
          )
        ),
      ],
      [
        factory.createParameterDeclaration(
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
          factory.createToken(ts.SyntaxKind.QuestionToken),
          factory.createTypeReferenceNode(
            factory.createIdentifier('Callbacks'),
            undefined
          ),
          undefined
        ),
      ],
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
      factory.createIdentifier('createAPIOperationClient'),
      [
        factory.createTypeParameterDeclaration(
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
        factory.createTypeParameterDeclaration(
          undefined,
          factory.createIdentifier('Callbacks'),
          factory.createTypeReferenceNode(factory.createIdentifier('Partial'), [
            factory.createTypeReferenceNode(
              factory.createIdentifier('AllCallbacks'),
              undefined
            ),
          ]),
          factory.createTypeReferenceNode(
            factory.createIdentifier('DefaultCallbacks'),
            undefined
          )
        ),
      ],
      [
        factory.createParameterDeclaration(
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
        factory.createParameterDeclaration(
          undefined,
          undefined,
          factory.createIdentifier('callbacks'),
          factory.createToken(ts.SyntaxKind.QuestionToken),
          factory.createTypeReferenceNode(
            factory.createIdentifier('Callbacks'),
            undefined
          ),
          undefined
        ),
      ],
      factory.createTypeReferenceNode(
        factory.createIdentifier('APIBasicQueryClientServices'),
        [
          factory.createTypeReferenceNode(
            factory.createIdentifier('Services'),
            undefined
          ),
          factory.createTypeReferenceNode(
            factory.createIdentifier('DefaultCallbacks'),
            undefined
          ),
        ]
      ),
      undefined
    ),
    factory.createFunctionDeclaration(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier('createAPIOperationClient'),
      [
        factory.createTypeParameterDeclaration(
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
        factory.createTypeParameterDeclaration(
          undefined,
          factory.createIdentifier('Callbacks'),
          factory.createTypeReferenceNode(factory.createIdentifier('Partial'), [
            factory.createTypeReferenceNode(
              factory.createIdentifier('AllCallbacks'),
              undefined
            ),
          ]),
          factory.createTypeReferenceNode(
            factory.createIdentifier('DefaultCallbacks'),
            undefined
          )
        ),
      ],
      [
        factory.createParameterDeclaration(
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
        factory.createParameterDeclaration(
          undefined,
          undefined,
          factory.createIdentifier('callbacks'),
          factory.createToken(ts.SyntaxKind.QuestionToken),
          factory.createTypeReferenceNode(
            factory.createIdentifier('Callbacks'),
            undefined
          ),
          undefined
        ),
      ],
      factory.createTypeReferenceNode(
        factory.createIdentifier('APIBasicClientServices'),
        [
          factory.createTypeReferenceNode(
            factory.createIdentifier('Services'),
            undefined
          ),
          factory.createTypeReferenceNode(
            factory.createIdentifier('DefaultCallbacks'),
            undefined
          ),
        ]
      ),
      undefined
    ),
    factory.createFunctionDeclaration(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier('createAPIOperationClient'),
      [
        factory.createTypeParameterDeclaration(
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
        factory.createTypeParameterDeclaration(
          undefined,
          factory.createIdentifier('Callbacks'),
          factory.createTypeReferenceNode(factory.createIdentifier('Partial'), [
            factory.createTypeReferenceNode(
              factory.createIdentifier('AllCallbacks'),
              undefined
            ),
          ]),
          factory.createTypeReferenceNode(
            factory.createIdentifier('DefaultCallbacks'),
            undefined
          )
        ),
      ],
      [
        factory.createParameterDeclaration(
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
          factory.createIdentifier('callbacks'),
          factory.createToken(ts.SyntaxKind.QuestionToken),
          factory.createTypeReferenceNode(
            factory.createIdentifier('Callbacks'),
            undefined
          ),
          undefined
        ),
      ],
      factory.createTypeReferenceNode(
        factory.createIdentifier('APIUtilityClientServices'),
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
      factory.createIdentifier('createAPIOperationClient'),
      [
        factory.createTypeParameterDeclaration(
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
        factory.createTypeParameterDeclaration(
          undefined,
          factory.createIdentifier('Callbacks'),
          factory.createTypeReferenceNode(factory.createIdentifier('Partial'), [
            factory.createTypeReferenceNode(
              factory.createIdentifier('AllCallbacks'),
              undefined
            ),
          ]),
          factory.createTypeReferenceNode(
            factory.createIdentifier('DefaultCallbacks'),
            undefined
          )
        ),
      ],
      [
        factory.createParameterDeclaration(
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
          factory.createUnionTypeNode([
            factory.createTypeReferenceNode(
              factory.createIdentifier('CreateAPIClientOptions'),
              undefined
            ),
            factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
            factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
          ]),
          factory.createIdentifier('undefined')
        ),
        factory.createParameterDeclaration(
          undefined,
          undefined,
          factory.createIdentifier('callbacks'),
          undefined,
          factory.createTypeReferenceNode(
            factory.createIdentifier('Callbacks'),
            undefined
          ),
          factory.createAsExpression(
            factory.createIdentifier('defaultCallbacks'),
            factory.createTypeReferenceNode(
              factory.createIdentifier('Callbacks'),
              undefined
            )
          )
        ),
      ],
      factory.createUnionTypeNode([
        factory.createTypeReferenceNode(
          factory.createIdentifier('APIDefaultQueryClientServices'),
          [
            factory.createTypeReferenceNode(
              factory.createIdentifier('Services'),
              undefined
            ),
          ]
        ),
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
        factory.createTypeReferenceNode(
          factory.createIdentifier('APIBasicQueryClientServices'),
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
          factory.createIdentifier('APIBasicClientServices'),
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
          factory.createIdentifier('APIUtilityClientServices'),
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
      ]),
      factory.createBlock(
        [
          factory.createIfStatement(
            factory.createPrefixUnaryExpression(
              ts.SyntaxKind.ExclamationToken,
              factory.createIdentifier('options')
            ),
            factory.createReturnStatement(
              factory.createCallExpression(
                factory.createIdentifier('qraftAPIClient'),
                undefined,
                [
                  factory.createIdentifier('services'),
                  factory.createIdentifier('callbacks'),
                ]
              )
            ),
            undefined
          ),
          factory.createIfStatement(
            factory.createBinaryExpression(
              factory.createStringLiteral('requestFn'),
              factory.createToken(ts.SyntaxKind.InKeyword),
              factory.createIdentifier('options')
            ),
            factory.createReturnStatement(
              factory.createCallExpression(
                factory.createIdentifier('qraftAPIClient'),
                undefined,
                [
                  factory.createIdentifier('services'),
                  factory.createIdentifier('callbacks'),
                  factory.createIdentifier('options'),
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
                factory.createIdentifier('callbacks'),
                factory.createIdentifier('options'),
              ]
            )
          ),
        ],
        true
      )
    ),
    factory.createTypeAliasDeclaration(
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
  ];
};
