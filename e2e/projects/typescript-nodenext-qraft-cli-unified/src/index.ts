import type * as AsyncAPISchema from './asyncapi/schema.js';
import type * as OpenAPISchema from './openapi/schema.js';
import { createAPIClient } from './openapi/index.js';
import { services } from './openapi/services/index.js';

type OpenAPISchemaComponents = OpenAPISchema.components['schemas'];
type AsyncAPISchemaComponents = AsyncAPISchema.components['schemas'];

const _openAPITest: OpenAPISchemaComponents = {} as OpenAPISchemaComponents;
const _asyncAPITest: AsyncAPISchemaComponents = {} as AsyncAPISchemaComponents;

export type { OpenAPISchema, AsyncAPISchema };

export { createAPIClient, services };
