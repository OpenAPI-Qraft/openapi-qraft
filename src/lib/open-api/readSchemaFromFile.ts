import fs from 'node:fs';

import type { OpenAPISchemaType } from './OpenAPISchemaType.js';

export const readSchemaFromFile = async (filePath: string) => {
  const fileContent = await fs.promises.readFile(filePath, {
    encoding: 'utf-8',
  });

  if (fileContent.trim().startsWith('{')) {
    return JSON.parse(fileContent) as OpenAPISchemaType;
  }

  const { parse } = await import('yaml');

  return parse(fileContent) as OpenAPISchemaType;
};
