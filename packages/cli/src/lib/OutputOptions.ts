import { URL } from 'node:url';

import { ServiceBaseName } from './open-api/getServices.js';

export type OutputOptions = {
  fileHeader?: string;
  dir: URL;
  clean: boolean;
  postfixServices?: string;
  explicitImportExtensions?: boolean;
  servicesDirName: string;
  serviceNameBase?: ServiceBaseName;
};