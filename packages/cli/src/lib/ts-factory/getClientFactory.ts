import ts from 'typescript';

type Options = {
  servicesDirName: string;
  explicitImportExtensions: boolean;
};

export const getClientFactory = (options: Options) => {
  return [
    ...getClientImportsFactory(options),
    getCallbacksVariableFactory(),
    getCreateClientFunctionFactory(),
  ];
};

const getClientImportsFactory = ({
  servicesDirName,
  explicitImportExtensions,
}: Options) => {
  const factory = ts.factory;

  return [
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
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier('QraftClientOptions')
          ),
        ])
      ),
      factory.createStringLiteral('@openapi-qraft/react'),
      undefined
    ),
    ...serviceCallbacks.map((propertyName) =>
      factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          false,
          undefined,
          factory.createNamedImports([
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier(propertyName)
            ),
          ])
        ),
        factory.createStringLiteral(
          `@openapi-qraft/react/callbacks/${propertyName}`
        ),
        undefined
      )
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
            factory.createIdentifier('services')
          ),
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier('Services')
          ),
        ])
      ),
      factory.createStringLiteral(
        `./${servicesDirName}/index${explicitImportExtensions ? '.js' : ''}`
      ),
      undefined
    ),
  ];
};

const getCallbacksVariableFactory = () => {
  const factory = ts.factory;

  return factory.createVariableStatement(
    undefined,
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier('callbacks'),
          undefined,
          undefined,
          factory.createObjectLiteralExpression(
            serviceCallbacks.map((propertyName) =>
              factory.createShorthandPropertyAssignment(
                factory.createIdentifier(propertyName),
                undefined
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

const getCreateClientFunctionFactory = () => {
  const factory = ts.factory;

  return factory.createFunctionDeclaration(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    undefined,
    factory.createIdentifier('createAPIClient'),
    undefined,
    [
      factory.createParameterDeclaration(
        undefined,
        undefined,
        factory.createIdentifier('options'),
        factory.createToken(ts.SyntaxKind.QuestionToken),
        factory.createTypeReferenceNode(
          factory.createIdentifier('QraftClientOptions'),
          undefined
        ),
        undefined
      ),
    ],
    factory.createTypeReferenceNode(
      factory.createIdentifier('Services'),
      undefined
    ),
    factory.createBlock(
      [
        factory.createReturnStatement(
          factory.createCallExpression(
            factory.createIdentifier('qraftAPIClient'),
            [
              factory.createTypeReferenceNode(
                factory.createIdentifier('Services'),
                undefined
              ),
              factory.createTypeQueryNode(
                factory.createIdentifier('callbacks'),
                undefined
              ),
            ],
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
  );
};

const serviceCallbacks = [
  'getInfiniteQueryData',
  'getInfiniteQueryKey',
  'getMutationKey',
  'getQueryData',
  'getQueryKey',
  'mutationFn',
  'queryFn',
  'setInfiniteQueryData',
  'setQueryData',
  'useInfiniteQuery',
  'useMutation',
  'useQuery',
  'useSuspenseQuery',
  'useSuspenseInfiniteQuery',
  'useMutationState',
  'useIsMutating',
  'useQueries',
  'useSuspenseQueries',
  'invalidateQueries',
  'cancelQueries',
  'resetQueries',
  'removeQueries',
  'refetchQueries',
  'isFetching',
  'useIsFetching',
  'fetchQuery',
  'prefetchQuery',
  'fetchInfiniteQuery',
  'prefetchInfiniteQuery',
] as const;
