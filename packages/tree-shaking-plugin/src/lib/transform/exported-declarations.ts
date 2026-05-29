import type { QraftModuleAccess } from '../resolvers/common.js';
import { parse } from '@babel/parser';
import * as t from '@babel/types';
import { findExportReexport } from './ast-utils.js';
import { normalizeResolvedId } from './path-rendering.js';

export type ExportedDeclarationResolution = {
  sourceFile: string;
  sourceLoadId: string;
  ast: t.File;
  init: t.Node;
  importBindings: Map<string, { imported: string; resolvedId: string | null }>;
};

export async function readExportedDeclarationChain(
  startFile: string,
  exportName: string,
  moduleAccess: QraftModuleAccess,
  seen = new Set<string>()
): Promise<ExportedDeclarationResolution | null> {
  const sourceFile = normalizeResolvedId(startFile);
  if (seen.has(sourceFile)) return null;
  seen.add(sourceFile);

  const source = await moduleAccess.load(startFile);
  if (source === null) {
    return null;
  }

  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript'],
  });
  const declarations = readTopLevelDeclarations(ast);
  const exported = findExportedDeclaration(ast, declarations, exportName);
  if (exported) {
    return {
      sourceFile,
      sourceLoadId: startFile,
      ast,
      init: exported,
      importBindings: await readTopLevelImportBindings(
        ast,
        sourceFile,
        moduleAccess.resolve
      ),
    };
  }

  const reexport = findExportReexport(ast, exportName);
  if (!reexport) return null;

  const resolved = await moduleAccess.resolve(reexport.source, sourceFile);
  if (!resolved) return null;
  const resolvedId = normalizeResolvedId(resolved);
  if (resolvedId === sourceFile) return null;

  return readExportedDeclarationChain(
    resolved,
    reexport.localName,
    moduleAccess,
    seen
  );
}

export async function matchesConfiguredBinding(
  localName: string,
  exportName: string,
  expectedResolvedIds: ReadonlySet<string>,
  importerId: string,
  imports: Map<string, { imported: string; resolvedId: string | null }>
) {
  const imported = imports.get(localName);
  if (imported) {
    return (
      imported.imported === exportName &&
      Boolean(
        imported.resolvedId && expectedResolvedIds.has(imported.resolvedId)
      )
    );
  }

  if (localName !== exportName) return false;
  const importerResolvedId = normalizeResolvedId(importerId);
  return expectedResolvedIds.has(importerResolvedId);
}

async function readTopLevelImportBindings(
  ast: t.File,
  importerId: string,
  resolveModule: QraftModuleAccess['resolve']
) {
  const imports = new Map<
    string,
    { imported: string; resolvedId: string | null }
  >();

  for (const node of ast.program.body) {
    if (!t.isImportDeclaration(node)) continue;
    const resolved = await resolveModule(node.source.value, importerId);
    const resolvedId = resolved ? normalizeResolvedId(resolved) : null;

    for (const specifier of node.specifiers) {
      if (t.isImportSpecifier(specifier) && t.isIdentifier(specifier.local)) {
        const imported = t.isIdentifier(specifier.imported)
          ? specifier.imported.name
          : specifier.imported.value;
        imports.set(specifier.local.name, {
          imported,
          resolvedId,
        });
      }
      if (t.isImportDefaultSpecifier(specifier)) {
        imports.set(specifier.local.name, {
          imported: 'default',
          resolvedId,
        });
      }
    }
  }

  return imports;
}

function readTopLevelDeclarations(ast: t.File) {
  const declarations = new Map<string, t.Node | null>();

  for (const statement of ast.program.body) {
    const declaration = t.isExportNamedDeclaration(statement)
      ? statement.declaration
      : statement;
    if (t.isFunctionDeclaration(declaration) && declaration.id) {
      declarations.set(declaration.id.name, declaration);
      continue;
    }
    if (!t.isVariableDeclaration(declaration)) continue;
    for (const item of declaration.declarations) {
      if (!t.isIdentifier(item.id)) continue;
      declarations.set(
        item.id.name,
        t.isExpression(item.init) ? item.init : null
      );
    }
  }

  return declarations;
}

function findExportedDeclaration(
  ast: t.File,
  declarations: Map<string, t.Node | null>,
  exportName: string
): t.Node | null {
  for (const statement of ast.program.body) {
    if (exportName === 'default' && t.isExportDefaultDeclaration(statement)) {
      if (t.isIdentifier(statement.declaration)) {
        return declarations.get(statement.declaration.name) ?? null;
      }
      if (t.isExpression(statement.declaration)) return statement.declaration;
    }

    if (!t.isExportNamedDeclaration(statement)) continue;
    if (t.isFunctionDeclaration(statement.declaration)) {
      if (statement.declaration.id?.name === exportName) {
        return statement.declaration;
      }
    }
    if (t.isVariableDeclaration(statement.declaration)) {
      for (const declaration of statement.declaration.declarations) {
        if (!t.isIdentifier(declaration.id)) continue;
        if (declaration.id.name !== exportName) continue;
        return t.isExpression(declaration.init) ? declaration.init : null;
      }
    }

    for (const specifier of statement.specifiers) {
      if (!t.isExportSpecifier(specifier)) continue;
      const exportedName = t.isIdentifier(specifier.exported)
        ? specifier.exported.name
        : specifier.exported.value;
      if (exportedName !== exportName) continue;
      if (!t.isIdentifier(specifier.local)) continue;
      return declarations.get(specifier.local.name) ?? null;
    }
  }

  return null;
}
