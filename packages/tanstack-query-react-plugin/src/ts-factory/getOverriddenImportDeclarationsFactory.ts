import type { ImportDeclaration } from 'typescript';
import type { OverrideImportType } from './OverrideImportType.js';
import ts from 'typescript';

export function getOverriddenImportDeclarationsFactory(
  moduleImports: Record<string, string[]>,
  serviceImportTypeOverrides: OverrideImportType[keyof OverrideImportType]
) {
  const customImportDeclarations: ImportDeclaration[] = [];

  if (serviceImportTypeOverrides) {
    Object.entries(moduleImports).forEach(([moduleName, importSpecifiers]) => {
      if (serviceImportTypeOverrides[moduleName]) {
        const importsByPath: Record<string, string[]> = {};

        importSpecifiers.forEach((specifier) => {
          if (serviceImportTypeOverrides[moduleName][specifier]) {
            const customPath =
              serviceImportTypeOverrides[moduleName][specifier];
            if (!importsByPath[customPath]) {
              importsByPath[customPath] = [];
            }
            importsByPath[customPath].push(specifier);
          }
        });

        Object.entries(importsByPath).forEach(([customPath, specifiers]) => {
          customImportDeclarations.push(
            ts.factory.createImportDeclaration(
              undefined,
              ts.factory.createImportClause(
                true,
                undefined,
                ts.factory.createNamedImports(
                  specifiers.map((specifier) =>
                    ts.factory.createImportSpecifier(
                      false,
                      undefined,
                      ts.factory.createIdentifier(specifier)
                    )
                  )
                )
              ),
              ts.factory.createStringLiteral(customPath)
            )
          );
        });
      }
    });
  }

  return customImportDeclarations;
}
