import type * as OpenAPICli from './openapi-cli/schema.js';
import type * as AsyncAPICli from './asyncapi-cli/asyncapi.js';
import type * as OpenAPIRedocly from './openapi-redocly/schema.js';
import type * as AsyncAPIRedocly from './asyncapi-redocly/asyncapi.js';

type OpenAPICliSchema = OpenAPICli.components['schemas'];
type AsyncAPICliSchema = AsyncAPICli.components['schemas'];
type OpenAPIRedoclySchema = OpenAPIRedocly.components['schemas'];
type AsyncAPIRedoclySchema = AsyncAPIRedocly.components['schemas'];

const _openAPICliTest: OpenAPICliSchema = {} as OpenAPICliSchema;
const _asyncAPICliTest: AsyncAPICliSchema = {} as AsyncAPICliSchema;
const _openAPIRedoclyTest: OpenAPIRedoclySchema = {} as OpenAPIRedoclySchema;
const _asyncAPIRedoclyTest: AsyncAPIRedoclySchema = {} as AsyncAPIRedoclySchema;

export type {
  OpenAPICli,
  AsyncAPICli,
  OpenAPIRedocly,
  AsyncAPIRedocly,
};
