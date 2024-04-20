import { createRequire } from 'node:module';
import { URL } from 'node:url';

export function maybeGetModulePath(modulePath: string, cwd: URL) {
  try {
    return createRequire(cwd).resolve(modulePath);
  } catch (error) {
    return;
  }
}
