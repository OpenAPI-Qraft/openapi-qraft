import * as fs from 'node:fs';
import * as ts from 'typescript-5.5.4';
import { generateFactoryCode } from './generateFactoryCode';

/**
 * Generates the factory code for a given source file
 * @param sourceFilePath - The path to the source file
 * @returns The factory code for the source file
 *
 * @example
 * ```ts
 * const sourceFilePath = '/path/to/file.ts';
 * const factoryCode = getSourceFileFactoryCode(sourceFilePath);
 * ```
 */
export function generateSourceFileFactoryCode(sourceFilePath: string): string {
  if (!fs.existsSync(sourceFilePath)) {
    throw new Error(`File "${sourceFilePath}" does not exist`);
  }

  // get ast
  const sourceFile = ts.createSourceFile(
    sourceFilePath,
    fs.readFileSync(sourceFilePath).toString('utf-8'),
    ts.ScriptTarget.Latest
  );

  // get the generated factory code
  return generateFactoryCode(ts, sourceFile);
}
