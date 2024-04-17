import type { URL } from 'node:url';

export type GeneratorFiles = Array<
  { file: URL; code: string } | { directory: URL; clean: boolean }
>;