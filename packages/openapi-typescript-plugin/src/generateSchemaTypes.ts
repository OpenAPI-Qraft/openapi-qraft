import type { Readable } from 'node:stream';
import type { OpenAPI3, OpenAPITSOptions } from 'openapi-typescript';
import { createConfig } from '@redocly/openapi-core';
import openapiTS, { astToString, SchemaObject } from 'openapi-typescript';
import ts from 'typescript';
import { createExportsForComponentSchemas } from './lib/createExportsForComponentSchemas.js';

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
      | 'enumValues'
      | 'dedupeEnums'
      | 'excludeDeprecated'
      | 'exportType'
      | 'immutable'
      | 'pathParamsAsTypes'
      | 'propertiesRequiredByDefault'
    > & {
      blobFromBinary?: boolean;
      explicitComponentExports?: boolean;
    };
  }
) {
  const ast = await openapiTS(schema, {
    transform: args.blobFromBinary ? transformFormatBinary : undefined,
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
    propertiesRequiredByDefault: args.propertiesRequiredByDefault,
    silent,
  });

  if (args.explicitComponentExports)
    return astToString(ast.concat(createExportsForComponentSchemas(ast)));

  return astToString(ast);
}

function transformFormatBinary(schemaObject: SchemaObject) {
  if (schemaObject.format !== 'binary') return;

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
