import type { Readable } from 'node:stream';
import type { URL } from 'node:url';
import type { OpenAPI3 } from 'openapi-typescript';

import { getServices, ServiceOutputOptions } from './getServices.js';
import { readSchema } from './readSchema.js';

export const getDocumentServices = async ({
  source,
  servicesGlob,
  output,
}: {
  source: string | URL | OpenAPI3 | Readable | Buffer;
  servicesGlob: string[] | undefined;
  output: ServiceOutputOptions;
}) => {
  const schema = await readSchema(source);
  return getServices(schema, output, servicesGlob);
};
