declare module 'openapi-typescript/dist/lib/redoc.js' {
  import type {
    Document,
    Config as RedoclyConfig,
  } from '@redocly/openapi-core';
  import type { OpenAPI3 } from 'openapi-typescript';
  import { Readable } from 'node:stream';
  import { BaseResolver } from '@redocly/openapi-core';

  export interface ValidateAndBundleOptions {
    redoc: RedoclyConfig;
    silent: boolean;
    cwd?: URL;
  }
  interface ParseSchemaOptions {
    absoluteRef: string;
    resolver: BaseResolver;
  }
  export declare function parseSchema(
    schema: unknown,
    { absoluteRef, resolver }: ParseSchemaOptions
  ): Promise<Document>;
  export declare function validateAndBundle(
    source: string | URL | OpenAPI3 | Readable | Buffer,
    options: ValidateAndBundleOptions
  ): Promise<any>;
}
