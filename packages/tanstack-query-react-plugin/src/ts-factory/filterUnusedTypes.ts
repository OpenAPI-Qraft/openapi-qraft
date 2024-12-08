import ts from 'typescript';

/**
 * Checks if a type is used in the given nodes.
 * @param typeImports Record<moduleName, typeName[]>
 * @param nodes
 * @returns Record<moduleName, typeName[]>
 */
export function filterUnusedTypes(
  typeImports: Record<string, string[]>,
  nodes: ts.Node[]
): Record<string, string[]> {
  const usedTypeImports: Record<string, string[]> = {};
  const targetTypeNames = Object.entries(typeImports).reduce<
    Record<string, string>
  >(
    (acc, [moduleName, typeImports]) =>
      typeImports.reduce((acc, typeName) => {
        acc[typeName] = moduleName;
        return acc;
      }, acc),
    {}
  );

  const transformer =
    (context: ts.TransformationContext) => (rootNode: ts.Node) => {
      function visit(node: ts.Node): ts.Node {
        if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
          const typeName = node.typeName.text;
          const moduleName = targetTypeNames[typeName];
          if (moduleName) {
            usedTypeImports[moduleName] ??= [];
            if (!usedTypeImports[moduleName].includes(typeName)) {
              usedTypeImports[moduleName].push(typeName);
              usedTypeImports[moduleName].sort();
            }
          }
        }

        return ts.visitEachChild(node, visit, context);
      }

      return ts.visitNode(rootNode, visit);
    };

  ts.transform(nodes, [transformer]).dispose();

  return usedTypeImports;
}
