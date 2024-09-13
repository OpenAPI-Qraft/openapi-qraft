#!/usr/bin/env tsx
import * as fs from 'fs';
import { getSourceFileFactoryCode } from './getSourceFileFactoryCode';

const sourceFileOptionIndex = process.argv.indexOf('--source-file');

if (sourceFileOptionIndex === -1) {
  throw new Error('Missing --source-file option');
}

const sourceFilePath = process.argv[sourceFileOptionIndex + 1];

if (!fs.existsSync(sourceFilePath)) {
  throw new Error(`File "${sourceFilePath}" does not exist`);
}

const factoryCode = getSourceFileFactoryCode(sourceFilePath);

const fileCode = `
import ts from "typescript";
const factory = ts.factory;
const nodes = ${factoryCode}
`;

const factoryFilePath = `${sourceFilePath.replace(/\.ts(x)?$/, 'Factory.ts$1')}`;
fs.writeFileSync(factoryFilePath, fileCode.trim() + '\n', {
  encoding: 'utf-8',
});

console.log(`✨ Generated factory code in "${factoryFilePath}"`);
