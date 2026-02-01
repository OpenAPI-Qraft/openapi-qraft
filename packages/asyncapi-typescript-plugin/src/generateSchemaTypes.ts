import type { AsyncAPITSOptions } from './types.js';
import asyncapiTS, { type AsyncAPITSInput, astToString } from './asyncapi.js';

export function generateSchemaTypes(
  input: AsyncAPITSInput,
  {
    silent,
    args,
  }: {
    silent: boolean;
    args: Omit<AsyncAPITSOptions, 'silent' | 'transform' | 'postTransform'>;
  }
): string {
  const ast = asyncapiTS(input, {
    ...args,
    silent,
  });

  return astToString(ast);
}
