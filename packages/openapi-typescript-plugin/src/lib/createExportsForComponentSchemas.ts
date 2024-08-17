import ts from 'typescript';

export function createExportsForComponentSchemas(ast: ts.Node[]) {
  const componentsInterface = ast
    .filter(ts.isInterfaceDeclaration)
    .find((node) => node.name.text === 'components');
  if (!componentsInterface) return [];

  const componentSchemas = componentsInterface.members
    .filter(ts.isPropertySignature)
    .find((node) => ts.isIdentifier(node.name) && node.name.text === 'schemas');
  if (!componentSchemas) return [];

  const exportedNames = getExportedNames(ast);
  const schemaNames =
    componentSchemas.type &&
    ts.isTypeLiteralNode(componentSchemas.type) &&
    componentSchemas.type.members.reduce<string[]>((acc, node) => {
      if (ts.isPropertySignature(node) && ts.isIdentifier(node.name)) {
        const componentName = node.name.text;
        if (!exportedNames.includes(componentName)) acc.push(componentName);
      }
      return acc;
    }, []);
  if (!schemaNames) return [];

  const exportStatements = schemaNames.map((name) => {
    return ts.factory.createTypeAliasDeclaration(
      [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createIdentifier(name),
      undefined,
      ts.factory.createIndexedAccessTypeNode(
        ts.factory.createIndexedAccessTypeNode(
          ts.factory.createTypeReferenceNode(
            ts.factory.createIdentifier('components'),
            undefined
          ),
          ts.factory.createLiteralTypeNode(
            ts.factory.createStringLiteral('schemas')
          )
        ),
        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(name))
      )
    );
  });

  return exportStatements;
}

function getExportedNames(ast: ts.Node[]) {
  return ast.reduce<string[]>((acc, node) => {
    if (
      ts.isInterfaceDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      )
    )
      acc.push(node.name.text);

    return acc;
  }, []);
}
