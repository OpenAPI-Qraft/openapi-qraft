import type { URL } from 'node:url';

export type GeneratorFile =
  | { file: URL; code: string }
  | { directory: URL; clean: boolean };
