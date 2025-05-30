import type { ImportDeclaration } from 'typescript';
import type { OverrideImportType } from './OverrideImportType.js';
import { factory } from 'typescript';

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
            factory.createImportDeclaration(
              undefined,
              factory.createImportClause(
                true,
                undefined,
                factory.createNamedImports(
                  specifiers.map((specifier) =>
                    factory.createImportSpecifier(
                      false,
                      undefined,
                      factory.createIdentifier(specifier)
                    )
                  )
                )
              ),
              factory.createStringLiteral(customPath)
            )
          );
        });
      }
    });
  }

  return customImportDeclarations;
}
