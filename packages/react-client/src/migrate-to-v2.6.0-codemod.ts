import type { API, FileInfo, Options } from 'jscodeshift';

export default function transformer(
  file: FileInfo,
  api: API,
  options: Options
) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Get the package name from options or use the default value
  const packageName = options.packageName || '@openapi-qraft/react-client';

  // Check if qraftAPIClient is imported from our module
  const hasQraftImport =
    root
      .find(j.ImportDeclaration, {
        source: {
          type: 'StringLiteral',
          value: packageName,
        },
      })
      .find(j.ImportSpecifier, {
        imported: {
          type: 'Identifier',
          name: 'qraftAPIClient',
        },
      })
      .size() > 0;

  // If there is no import from our module, we don't make any changes
  if (!hasQraftImport) {
    return file.source;
  }

  // The TypeParameters type differs in different parsers
  // We check both possible variants
  return root
    .find(j.CallExpression, {
      callee: {
        type: 'Identifier',
        name: 'qraftAPIClient',
      },
    })
    .forEach((path) => {
      // Cast node to a type with possible typeParameters/typeArguments properties
      const node = path.node;

      // Remove generics, checking different possible property names
      if ('typeParameters' in node) {
        delete node.typeParameters;
      }
    })
    .toSource();
}
