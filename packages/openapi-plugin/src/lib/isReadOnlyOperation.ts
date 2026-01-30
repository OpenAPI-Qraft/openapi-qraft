export function isReadOnlyOperation(operation: {
  readonly method:
    | 'get'
    | 'put'
    | 'post'
    | 'patch'
    | 'delete'
    | 'options'
    | 'head'
    | 'trace';
}) {
  return (
    operation.method === 'get' ||
    operation.method === 'head' ||
    operation.method === 'trace' ||
    operation.method === 'options'
  );
}
