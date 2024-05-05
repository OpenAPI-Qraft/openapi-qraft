import { createConfig } from '@redocly/openapi-core';

import type { Readable } from 'node:stream';
import openapiTS, {
  astToString,
  type OpenAPI3,
  type OpenAPITSOptions,
} from 'openapi-typescript';
import ts from 'typescript';

export async function generateSchemaTypes(
  schema: string | URL | OpenAPI3 | Readable | Buffer,
  {
    silent,
    args,
  }: {
    silent: boolean;
    args: Pick<
      OpenAPITSOptions,
      | 'additionalProperties'
      | 'alphabetize'
      | 'arrayLength'
      | 'defaultNonNullable'
      | 'emptyObjectsUnknown'
      | 'enum'
      | 'excludeDeprecated'
      | 'exportType'
      | 'immutable'
      | 'pathParamsAsTypes'
    >;
  }
) {
  return astToString(
    await openapiTS(schema, {
      transform(schemaObject) {
        if (schemaObject.format === 'binary') {
          return {
            schema: schemaObject.nullable
              ? ts.factory.createUnionTypeNode([
                  ts.factory.createTypeReferenceNode(
                    ts.factory.createIdentifier('Blob'),
                    undefined
                  ),
                  ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                ])
              : ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier('Blob'),
                  undefined
                ),
            // questionToken will be inferred by `openapiTS`, if true, it will force `?` for parameter
            questionToken: false,
          };
        }
      },
      additionalProperties: args.additionalProperties,
      alphabetize: args.alphabetize,
      arrayLength: args.arrayLength,
      // contentNever: args.contentNever, // todo::add `contentNever` in new version
      defaultNonNullable: args.defaultNonNullable,
      emptyObjectsUnknown: args.emptyObjectsUnknown,
      enum: args.enum,
      excludeDeprecated: args.excludeDeprecated,
      exportType: args.exportType,
      immutable: args.immutable,
      pathParamsAsTypes: args.pathParamsAsTypes,
      redocly: await createConfig({}, { extends: ['minimal'] }),
      silent,
    })
  );
}
