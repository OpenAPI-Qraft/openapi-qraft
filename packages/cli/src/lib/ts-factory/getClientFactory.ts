import { Service } from 'src/lib/open-api/getServices.js';
import ts from 'typescript';

type Options = {
  servicesDirName: string;
  explicitImportExtensions: boolean;
  services?: Service[];
};

export const getClientFactory = (options: Options) => {
  return [
    ...getClientImportsFactory(options),
    getCallbacksVariableFactory(options),
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

const getCallbacksVariableFactory = ({ services }: Options) => {
  const factory = ts.factory;

  const operations = (services ?? [])
    .map((service) => service.operations)
    .reduce((acc, curr) => {
      return acc.concat(curr);
    }, []);

  return factory.createVariableStatement(
    undefined,
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier('callbacks'),
          undefined,
          undefined,
          factory.createObjectLiteralExpression(
            [
              ...serviceCallbacks.map((propertyName) =>
                factory.createShorthandPropertyAssignment(
                  factory.createIdentifier(propertyName),
                  undefined
                )
              ),
              ...operations.map((operation) => {
                return factory.createPropertyAssignment(
                  factory.createIdentifier(operation.name),
                  factory.createIdentifier(`(options: any, schema: any, args: any) => {
                    const ${operation.method === 'get' ? `[parameters, requestOptions]` : `[parameters, body, requestOptions]`} = args;

                    const response = options.requestFn(schema, {
                        parameters,
                        ${operation.method === 'get' ? '' : 'body,'}
                        baseUrl: options?.baseUrl,
                        ...requestOptions
                    });

                    const contentType = response.headers.get('Content-Type');

                    try {
                      if (contentType.includes('application/json')) {
                        const data = await response.json();
                        return { data, status: response.status, headers: response.headers };
                      }
                      
                      if (contentType.includes('text/plain')) {
                        const data = await response.text();
                        return { data, status: response.status, headers: response.headers };
                      }  
                      
                      if (contentType.includes('text/xml') || contentType.includes('application/xml')) {
                        const data = await response.text();
                        return { data, status: response.status, headers: response.headers };
                      } 
                      
                      throw new Error('Unsupported content type');
                    } catch (error) {
                      throw error;
                    }
                  }`)
                );
              }),
            ],
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
  'getQueriesData',
  'getQueryKey',
  'mutationFn',
  'queryFn',
  'setInfiniteQueryData',
  'setQueryData',
  'setQueriesData',
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
  'isMutating',
  'useIsFetching',
  'fetchQuery',
  'prefetchQuery',
  'fetchInfiniteQuery',
  'prefetchInfiniteQuery',
  'getQueryState',
  'getInfiniteQueryState',
] as const;
