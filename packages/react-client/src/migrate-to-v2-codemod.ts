import {
  API,
  ASTPath,
  CallExpression,
  FileInfo,
  MemberExpression,
  Options,
} from 'jscodeshift';

export default function transformer(
  file: FileInfo,
  api: API,
  options: Options
) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const methodNames = [
    'fetchQuery',
    'fetchInfiniteQuery',
    'prefetchQuery',
    'prefetchInfiniteQuery',
    'getQueryData',
    'getQueriesData',
    'setQueryData',
    'getQueryState',
    'setQueriesData',
    'invalidateQueries',
    'refetchQueries',
    'cancelQueries',
    'removeQueries',
    'resetQueries',
    'isFetching',
    'isMutating',
    'setInfiniteQueryData',
    'getInfiniteQueryData',
    'getInfiniteQueryState',
  ];

  const hooksWithTwoArgs = [
    'useSuspenseQueries',
    'useIsFetching',
    'useMutationState',
    'useIsMutating',
  ];

  const hooksWithThreeArgs = [
    'useQuery',
    'useMutation',
    'useInfiniteQuery',
    'useQueries',
    'useSuspenseQuery',
    'useSuspenseInfiniteQuery',
  ];

  const apiClientVariableNames = getAPIClientVariableNames(options);

  return root
    .find(j.CallExpression)
    .forEach((path: ASTPath<CallExpression>) => {
      const callee = path.node.callee;
      if (callee.type === 'MemberExpression') {
        const apiClientCallMethodName = getAPIClientCallMethodName(
          callee,
          apiClientVariableNames
        );
        if (apiClientCallMethodName) {
          if (methodNames.includes(apiClientCallMethodName)) {
            // Remove the last argument `queryClient`
            path.node.arguments = path.node.arguments.slice(0, -1);
          } else if (
            hooksWithTwoArgs.includes(apiClientCallMethodName) &&
            path.node.arguments.length === 2
          ) {
            // Remove the second argument for specific hooks if there are exactly two arguments
            path.node.arguments = path.node.arguments.slice(0, 1);
          } else if (
            hooksWithThreeArgs.includes(apiClientCallMethodName) &&
            path.node.arguments.length === 3
          ) {
            // Remove the third argument for specific hooks if there are exactly three arguments
            path.node.arguments = path.node.arguments.slice(0, 2);
          }
        }
      }
    })
    .toSource();
}

function getAPIClientCallMethodName(
  node: MemberExpression,
  apiClientNames: string[]
): string | undefined {
  if (
    node.object.type === 'MemberExpression' &&
    node.object.object.type === 'MemberExpression' &&
    node.object.object.object.type === 'Identifier' &&
    node.object.object.property.type === 'Identifier' &&
    node.object.property.type === 'Identifier' &&
    node.property.type === 'Identifier'
  ) {
    const apiClientVariableName = node.object.object.object.name;

    if (apiClientNames.includes(apiClientVariableName))
      return node.property.name;
  }
}

function getAPIClientVariableNames(options: Options) {
  const apiClientVariableNameOption = options['api-client-variable-name'];

  if (!apiClientVariableNameOption) return ['api', 'qraft'];

  return String(apiClientVariableNameOption)
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
}
