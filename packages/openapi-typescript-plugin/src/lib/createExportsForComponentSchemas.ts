import ts from 'typescript';

export function createExportsForComponentSchemas(ast: ts.Node[]) {
  const componentsInterface = ast.find(
    (n) => isInterfaceDeclaration(n) && n.name.escapedText === 'components'
  ) as ts.InterfaceDeclaration | undefined;
  if (!componentsInterface) return [];

  const componentSchemas = componentsInterface.members.find(
    (n) =>
      isPropertySignature(n) &&
      isIdentifier(n.name) &&
      n.name.escapedText === 'schemas'
  ) as ts.PropertySignature | undefined;
  if (!componentSchemas) return [];

  const exportedNames = getExportedNames(ast);
  const schemaNames =
    isTypeLiteral(componentSchemas.type) &&
    (componentSchemas.type.members
      .map(
        (m) =>
          isPropertySignature(m) && isIdentifier(m.name) && m.name.escapedText
      )
      .filter((name) => !!name && !exportedNames.includes(name)) as string[]);
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
  return ast.reduce<string[]>((acc, curr) => {
    const hasExportModifier = (curr as any).modifiers?.some(isExportKeyword);
    if (!hasExportModifier) return acc;

    const hasIdentifier = isIdentifier((curr as any).name);
    if (!hasIdentifier) return acc;

    const identifier = (curr as any).name as ts.Identifier;
    acc.push(identifier.escapedText as string);

    return acc;
  }, []);
}

function isInterfaceDeclaration(
  node: ts.Node
): node is ts.InterfaceDeclaration {
  return node.kind === ts.SyntaxKind.InterfaceDeclaration;
}

function isPropertySignature(node?: ts.Node): node is ts.PropertySignature {
  return node?.kind === ts.SyntaxKind.PropertySignature;
}

function isIdentifier(node?: ts.Node): node is ts.Identifier {
  return node?.kind === ts.SyntaxKind.Identifier;
}

function isTypeLiteral(node?: ts.Node): node is ts.TypeLiteralNode {
  return node?.kind === ts.SyntaxKind.TypeLiteral;
}

function isExportKeyword(node?: ts.Node): node is ts.ExportKeyword {
  return node?.kind === ts.SyntaxKind.ExportKeyword;
}
