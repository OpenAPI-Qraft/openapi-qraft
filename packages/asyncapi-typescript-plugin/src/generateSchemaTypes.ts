import type { AsyncAPITSOptions } from './types.js';
import asyncapiTS, { astToString } from './asyncapi.js';

export async function generateSchemaTypes(
  schema: string | URL | Record<string, unknown>,
  {
    silent,
    args,
  }: {
    silent: boolean;
    args: Omit<AsyncAPITSOptions, 'silent' | 'transform' | 'postTransform'>;
  }
): Promise<string> {
  const ast = await asyncapiTS(schema, {
    ...args,
    silent,
  });

  return astToString(ast);
}
