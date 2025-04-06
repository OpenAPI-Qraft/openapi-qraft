#!/usr/bin/env node
import * as fs from 'fs';
import { generateCode } from 'ts-factory-code-generator-generator';

console.log('🏗️ Generating code for TypeScript Factory Generator...');

fs.writeFileSync(
  './src/generateFactoryCode.ts',
  generateCode('typescript-5.5.4'),
  { encoding: 'utf-8' }
);
