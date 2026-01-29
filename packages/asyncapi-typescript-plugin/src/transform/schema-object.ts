import type {
  AsyncAPIContext,
  ReferenceObject,
  SchemaObject,
} from '../types.js';
import { parseRef } from '@redocly/openapi-core/lib/ref-utils.js';
import {
  addJSDocComment,
  BOOLEAN,
  NEVER,
  NULL,
  NUMBER,
  oapiRef,
  QUESTION_TOKEN,
  STRING,
  tsArrayLiteralExpression,
  tsEnum,
  tsIntersection,
  tsIsPrimitive,
  tsLiteral,
  tsModifiers,
  tsNullable,
  tsOmit,
  tsPropertyIndex,
  tsRecord,
  tsUnion,
  tsWithRequired,
  UNDEFINED,
  UNKNOWN,
} from 'openapi-typescript/dist/lib/ts.js';
import { createRef, getEntries } from 'openapi-typescript/dist/lib/utils.js';
import ts from 'typescript';

export interface TransformSchemaOptions {
  path?: string;
  schema?: SchemaObject | ReferenceObject;
  ctx: AsyncAPIContext;
}

export default function transformSchemaObject(
  schemaObject: SchemaObject | ReferenceObject,
  options: TransformSchemaOptions
): ts.TypeNode {
  const type = transformSchemaObjectWithComposition(schemaObject, options);
  if (typeof options.ctx.postTransform === 'function') {
    const postTransformResult = options.ctx.postTransform(type, options as any);
    if (postTransformResult) {
      return postTransformResult;
    }
  }
  return type;
}

function transformSchemaObjectWithComposition(
  schemaObject: SchemaObject | ReferenceObject,
  options: TransformSchemaOptions
): ts.TypeNode {
  if (!schemaObject) {
    return NEVER;
  }
  if ((schemaObject as unknown) === true) {
    return UNKNOWN;
  }
  if (Array.isArray(schemaObject) || typeof schemaObject !== 'object') {
    throw new Error(
      `Expected SchemaObject, received ${Array.isArray(schemaObject) ? 'Array' : typeof schemaObject} at ${options.path}`
    );
  }

  if ('$ref' in schemaObject) {
    return oapiRef(schemaObject.$ref);
  }

  if (schemaObject.const !== null && schemaObject.const !== undefined) {
    return tsLiteral(schemaObject.const);
  }

  if (
    Array.isArray(schemaObject.enum) &&
    (!('type' in schemaObject) || schemaObject.type !== 'object') &&
    !('properties' in schemaObject) &&
    !('additionalProperties' in schemaObject)
  ) {
    if (
      options.ctx.enum &&
      schemaObject.enum.every(
        (v) => typeof v === 'string' || typeof v === 'number' || v === null
      )
    ) {
      let enumName = parseRef(options.path ?? '').pointer.join('/');
      enumName = enumName.replace('components/schemas', '');
      const metadata = schemaObject.enum.map((_, i) => ({
        name:
          schemaObject['x-enum-varnames']?.[i] ??
          schemaObject['x-enumNames']?.[i],
        description:
          schemaObject['x-enum-descriptions']?.[i] ??
          schemaObject['x-enumDescriptions']?.[i],
      }));

      let hasNull = false;
      const validSchemaEnums = schemaObject.enum.filter((enumValue) => {
        if (enumValue === null) {
          hasNull = true;
          return false;
        }
        return true;
      });
      const enumType = tsEnum(
        enumName,
        validSchemaEnums as (string | number)[],
        metadata,
        {
          shouldCache: options.ctx.dedupeEnums,
          export: true,
        }
      );
      if (!options.ctx.injectFooter.includes(enumType)) {
        options.ctx.injectFooter.push(enumType);
      }
      const ref = ts.factory.createTypeReferenceNode(enumType.name);
      return hasNull ? tsUnion([ref, NULL]) : ref;
    }
    const enumType = schemaObject.enum.map(tsLiteral);
    if (
      (Array.isArray(schemaObject.type) &&
        schemaObject.type.includes('null')) ||
      schemaObject.nullable
    ) {
      enumType.push(NULL);
    }

    const unionType = tsUnion(enumType);

    if (
      options.ctx.enumValues &&
      schemaObject.enum.every(
        (v) => typeof v === 'string' || typeof v === 'number'
      )
    ) {
      let enumValuesVariableName = parseRef(options.path ?? '').pointer.join(
        '/'
      );
      enumValuesVariableName = enumValuesVariableName.replace(
        'components/schemas',
        ''
      );
      enumValuesVariableName = `${enumValuesVariableName}Values`;

      const enumValuesArray = tsArrayLiteralExpression(
        enumValuesVariableName,
        oapiRef(options.path ?? ''),
        schemaObject.enum as (string | number)[],
        {
          export: true,
          readonly: true,
          injectFooter: options.ctx.injectFooter,
        }
      );

      options.ctx.injectFooter.push(enumValuesArray);
    }

    return unionType;
  }

  function collectUnionCompositions(items: (SchemaObject | ReferenceObject)[]) {
    const output: ts.TypeNode[] = [];
    for (const item of items) {
      output.push(transformSchemaObject(item, options));
    }
    return output;
  }

  function collectAllOfCompositions(
    items: (SchemaObject | ReferenceObject)[],
    required?: string[]
  ): ts.TypeNode[] {
    const output: ts.TypeNode[] = [];
    for (const item of items) {
      let itemType: ts.TypeNode;
      if ('$ref' in item) {
        itemType = transformSchemaObject(item, options);
        const resolved = options.ctx.resolve<SchemaObject>(item.$ref);
        if (
          resolved &&
          typeof resolved === 'object' &&
          'properties' in resolved
        ) {
          const validRequired = (required ?? []).filter(
            (key) => !!resolved.properties?.[key]
          );
          if (validRequired.length) {
            itemType = tsWithRequired(
              itemType,
              validRequired,
              options.ctx.injectFooter
            );
          }
        }
      } else {
        const itemRequired = [...(required ?? [])];
        if (typeof item === 'object' && Array.isArray(item.required)) {
          itemRequired.push(...item.required);
        }
        itemType = transformSchemaObject(
          { ...item, required: itemRequired },
          options
        );
      }
      output.push(itemType);
    }
    return output;
  }

  let finalType: ts.TypeNode | undefined = undefined;

  const coreObjectType = transformSchemaObjectCore(schemaObject, options);
  const allOfType = collectAllOfCompositions(
    schemaObject.allOf ?? [],
    schemaObject.required
  );
  if (coreObjectType || allOfType.length) {
    const allOf: ts.TypeNode | undefined = allOfType.length
      ? tsIntersection(allOfType)
      : undefined;
    finalType = tsIntersection([
      ...(coreObjectType ? [coreObjectType] : []),
      ...(allOf ? [allOf] : []),
    ]);
  }

  const anyOfType = collectUnionCompositions(schemaObject.anyOf ?? []);
  if (anyOfType.length) {
    finalType = tsUnion([...(finalType ? [finalType] : []), ...anyOfType]);
  }

  const oneOfType = collectUnionCompositions(
    schemaObject.oneOf ||
      ('type' in schemaObject &&
        schemaObject.type === 'object' &&
        (schemaObject.enum as (SchemaObject | ReferenceObject)[])) ||
      []
  );
  if (oneOfType.length) {
    if (oneOfType.every(tsIsPrimitive)) {
      finalType = tsUnion([...(finalType ? [finalType] : []), ...oneOfType]);
    } else {
      finalType = tsIntersection([
        ...(finalType ? [finalType] : []),
        tsUnion(oneOfType),
      ]);
    }
  }

  if (!finalType) {
    if ('type' in schemaObject) {
      finalType = tsRecord(
        STRING,
        options.ctx.emptyObjectsUnknown ? UNKNOWN : NEVER
      );
    } else {
      finalType = UNKNOWN;
    }
  }

  if (finalType !== UNKNOWN && schemaObject.nullable) {
    finalType = tsNullable([finalType]);
  }

  return finalType;
}

function transformSchemaObjectCore(
  schemaObject: SchemaObject,
  options: TransformSchemaOptions
): ts.TypeNode | undefined {
  if ('type' in schemaObject && schemaObject.type) {
    if (typeof options.ctx.transform === 'function') {
      const result = options.ctx.transform(schemaObject, options as any);
      if (result && typeof result === 'object') {
        if ('schema' in result) {
          if (result.questionToken) {
            return ts.factory.createUnionTypeNode([result.schema, UNDEFINED]);
          } else {
            return result.schema;
          }
        } else {
          return result as ts.TypeNode;
        }
      }
    }

    if (schemaObject.type === 'null') {
      return NULL;
    }
    if (schemaObject.type === 'string') {
      return STRING;
    }
    if (schemaObject.type === 'number' || schemaObject.type === 'integer') {
      return NUMBER;
    }
    if (schemaObject.type === 'boolean') {
      return BOOLEAN;
    }

    if (schemaObject.type === 'array') {
      let itemType: ts.TypeNode = UNKNOWN;
      if (schemaObject.prefixItems) {
        itemType = ts.factory.createTupleTypeNode(
          schemaObject.prefixItems.map((item) =>
            transformSchemaObject(item, options)
          )
        );
      } else if (Array.isArray(schemaObject.items)) {
        itemType = ts.factory.createTupleTypeNode(
          (schemaObject.items as (SchemaObject | ReferenceObject)[]).map(
            (item) => transformSchemaObject(item, options)
          )
        );
      } else if (schemaObject.items) {
        if (
          hasKey(schemaObject.items, 'type') &&
          (schemaObject.items as SchemaObject).type === 'array'
        ) {
          itemType = ts.factory.createArrayTypeNode(
            transformSchemaObject(schemaObject.items as SchemaObject, options)
          );
        } else {
          itemType = transformSchemaObject(
            schemaObject.items as SchemaObject | ReferenceObject,
            options
          );
        }
      }

      const finalType =
        ts.isTupleTypeNode(itemType) || ts.isArrayTypeNode(itemType)
          ? itemType
          : ts.factory.createArrayTypeNode(itemType);

      return options.ctx.immutable
        ? ts.factory.createTypeOperatorNode(
            ts.SyntaxKind.ReadonlyKeyword,
            finalType
          )
        : finalType;
    }

    if (Array.isArray(schemaObject.type) && !Array.isArray(schemaObject)) {
      const uniqueTypes: ts.TypeNode[] = [];
      for (const t of schemaObject.type) {
        if (t === 'null' || t === null) {
          uniqueTypes.push(NULL);
        } else {
          uniqueTypes.push(
            transformSchemaObject(
              { ...schemaObject, type: t } as SchemaObject,
              options
            )
          );
        }
      }
      return tsUnion(uniqueTypes);
    }
  }

  const coreObjectType: ts.TypeElement[] = [];

  if (
    ('properties' in schemaObject &&
      schemaObject.properties &&
      Object.keys(schemaObject.properties).length) ||
    ('additionalProperties' in schemaObject &&
      schemaObject.additionalProperties) ||
    ('$defs' in schemaObject && schemaObject.$defs)
  ) {
    if (Object.keys(schemaObject.properties ?? {}).length) {
      for (const [k, v] of getEntries(
        schemaObject.properties ?? {},
        options.ctx
      )) {
        if (
          (typeof v !== 'object' && typeof v !== 'boolean') ||
          Array.isArray(v)
        ) {
          throw new Error(
            `${options.path}: invalid property ${k}. Expected Schema Object or boolean, got ${
              Array.isArray(v) ? 'Array' : typeof v
            }`
          );
        }

        const { $ref, readOnly, hasDefault } =
          typeof v === 'object'
            ? {
                $ref: '$ref' in v && v.$ref,
                readOnly: 'readOnly' in v && v.readOnly,
                hasDefault: 'default' in v && v.default !== undefined,
              }
            : {};

        if (options.ctx.excludeDeprecated) {
          const resolved = $ref
            ? options.ctx.resolve<SchemaObject>($ref as string)
            : v;
          if ((resolved as SchemaObject)?.deprecated) {
            continue;
          }
        }
        let optional =
          schemaObject.required?.includes(k) ||
          (schemaObject.required === undefined &&
            options.ctx.propertiesRequiredByDefault) ||
          (hasDefault && options.ctx.defaultNonNullable)
            ? undefined
            : QUESTION_TOKEN;
        let type = $ref
          ? oapiRef($ref as string)
          : transformSchemaObject(v as SchemaObject, {
              ...options,
              path: createRef([options.path, k]),
            });

        if (typeof options.ctx.transform === 'function') {
          const result = options.ctx.transform(
            v as SchemaObject,
            options as any
          );
          if (result && typeof result === 'object') {
            if ('schema' in result) {
              type = result.schema;
              optional = result.questionToken ? QUESTION_TOKEN : optional;
            } else {
              type = result as ts.TypeNode;
            }
          }
        }

        const property = ts.factory.createPropertySignature(
          tsModifiers({
            readonly: options.ctx.immutable || readOnly,
          }),
          tsPropertyIndex(k),
          optional,
          type
        );
        addJSDocComment(v as any, property);
        coreObjectType.push(property);
      }
    }

    if (
      schemaObject.$defs &&
      typeof schemaObject.$defs === 'object' &&
      Object.keys(schemaObject.$defs).length
    ) {
      const defKeys: ts.TypeElement[] = [];
      for (const [k, v] of Object.entries(schemaObject.$defs)) {
        const property = ts.factory.createPropertySignature(
          tsModifiers({
            readonly:
              options.ctx.immutable || ('readonly' in v && !!v.readOnly),
          }),
          tsPropertyIndex(k),
          undefined,
          transformSchemaObject(v, {
            ...options,
            path: createRef([options.path, '$defs', k]),
          })
        );
        addJSDocComment(v, property);
        defKeys.push(property);
      }
      coreObjectType.push(
        ts.factory.createPropertySignature(
          undefined,
          tsPropertyIndex('$defs'),
          undefined,
          ts.factory.createTypeLiteralNode(defKeys)
        )
      );
    }

    if (schemaObject.additionalProperties || options.ctx.additionalProperties) {
      const hasExplicitAdditionalProperties =
        typeof schemaObject.additionalProperties === 'object' &&
        Object.keys(schemaObject.additionalProperties).length;
      const addlType = hasExplicitAdditionalProperties
        ? transformSchemaObject(
            schemaObject.additionalProperties as SchemaObject,
            options
          )
        : UNKNOWN;
      return tsIntersection([
        ...(coreObjectType.length
          ? [ts.factory.createTypeLiteralNode(coreObjectType)]
          : []),
        ts.factory.createTypeLiteralNode([
          ts.factory.createIndexSignature(
            tsModifiers({
              readonly: options.ctx.immutable,
            }),
            [
              ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                ts.factory.createIdentifier('key'),
                undefined,
                STRING
              ),
            ],
            addlType
          ),
        ]),
      ]);
    }
  }

  return coreObjectType.length
    ? ts.factory.createTypeLiteralNode(coreObjectType)
    : undefined;
}

function hasKey<K extends string>(
  possibleObject: unknown,
  key: K
): possibleObject is { [key in K]: unknown } {
  return (
    typeof possibleObject === 'object' &&
    possibleObject !== null &&
    key in possibleObject
  );
}
