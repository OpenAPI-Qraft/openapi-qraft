import type * as AsyncAPISelectiveSchema from './asyncapi-selective/schema.js';
import type * as AsyncAPISchema from './asyncapi/schema.js';
import type * as OpenAPISelectiveSchema from './openapi-selective/schema.js';
import type * as OpenAPISchema from './openapi/schema.js';
import { createAPIClient } from './openapi/index.js';
import { services } from './openapi/services/index.js';

type OpenAPISchemaComponents = OpenAPISchema.components['schemas'];
type AsyncAPISchemaComponents = AsyncAPISchema.components['schemas'];
type OpenAPISelectiveComponents = OpenAPISelectiveSchema.components['schemas'];
type AsyncAPISelectiveComponents =
  AsyncAPISelectiveSchema.components['schemas'];

const _openAPITest: OpenAPISchemaComponents = {} as OpenAPISchemaComponents;
const _asyncAPITest: AsyncAPISchemaComponents = {} as AsyncAPISchemaComponents;
const _openAPISelectiveTest: OpenAPISelectiveComponents =
  {} as OpenAPISelectiveComponents;
const _asyncAPISelectiveTest: AsyncAPISelectiveComponents =
  {} as AsyncAPISelectiveComponents;

export type {
  OpenAPISchema,
  AsyncAPISchema,
  OpenAPISelectiveSchema,
  AsyncAPISelectiveSchema,
};

export { createAPIClient, services };
