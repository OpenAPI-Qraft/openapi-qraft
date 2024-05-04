import { createConfig } from '@redocly/openapi-core';

import fs from 'node:fs';
import type { Readable, Writable } from 'node:stream';
import openapiTS, {
  astToString,
  COMMENT_HEADER,
  OpenAPI3,
  OpenAPITSOptions,
} from 'openapi-typescript';
import ts from 'typescript';

export async function generateAndWriteSchema(
  schema: string | URL | OpenAPI3 | Readable | Buffer,
  {
    cwd,
    output,
    args,
  }: {
    cwd: URL;
    output: string | Writable;
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
  const result = `${COMMENT_HEADER}${astToString(
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
      silent: typeof output !== 'string',
    })
  )}`;

  if (typeof output === 'string') {
    const outFile = new URL(output, cwd);
    fs.mkdirSync(new URL('.', outFile), { recursive: true });
    fs.writeFileSync(outFile, result, 'utf8');
  } else {
    // if stdout, (still) don’t log anything to console!
    output.write(result);
  }
}
