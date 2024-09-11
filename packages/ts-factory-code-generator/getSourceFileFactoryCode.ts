import * as fs from 'node:fs';
import * as ts from 'typescript-5.5.4';
import { generateFactoryCode } from './tsFactoryCodeGenerator';

export function getSourceFileFactoryCode(sourceFilePath: string) {
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
