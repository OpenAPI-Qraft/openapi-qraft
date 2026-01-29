import type {
  AsyncAPIContext,
  AsyncAPICorrelationIdObject,
  AsyncAPIMessageObject,
  AsyncAPIMessageTraitObject,
  ReferenceObject,
  SchemaObject,
} from '../types.js';
import {
  oapiRef,
  QUESTION_TOKEN,
  tsModifiers,
  tsPropertyIndex,
} from 'openapi-typescript/dist/lib/ts.js';
import { createRef } from 'openapi-typescript/dist/lib/utils.js';
import ts from 'typescript';
import {
  createLocationDescriptionType,
  transformLocationDescriptionValue,
} from './location-description.js';
import transformSchemaObject from './schema-object.js';

interface HeadersSource {
  headers: SchemaObject | ReferenceObject;
  traitRef?: string;
}

function getHeadersSource(
  message: AsyncAPIMessageObject,
  ctx: AsyncAPIContext
): HeadersSource | undefined {
  if (message.headers) {
    return { headers: message.headers };
  }

  if (!message.traits || !Array.isArray(message.traits)) {
    return undefined;
  }

  let result: HeadersSource | undefined;
  for (const traitRef of message.traits) {
    if (traitRef && '$ref' in traitRef) {
      const resolvedTrait = ctx.resolve<AsyncAPIMessageTraitObject>(
        traitRef.$ref
      );
      if (resolvedTrait?.headers) {
        result = { headers: resolvedTrait.headers, traitRef: traitRef.$ref };
      }
    }
  }

  return result;
}

interface CorrelationIdSource {
  location: string;
  description?: string;
  ref?: string;
}

function getContentType(
  message: AsyncAPIMessageObject,
  ctx: AsyncAPIContext
): string | undefined {
  if (message.contentType) {
    return message.contentType;
  }

  if (!message.traits || !Array.isArray(message.traits)) {
    return undefined;
  }

  let result: string | undefined;
  for (const traitRef of message.traits) {
    if (traitRef && '$ref' in traitRef) {
      const resolvedTrait = ctx.resolve<AsyncAPIMessageTraitObject>(
        traitRef.$ref
      );
      if (resolvedTrait?.contentType) {
        result = resolvedTrait.contentType;
      }
    }
  }

  return result;
}

function getCorrelationIdSource(
  message: AsyncAPIMessageObject,
  ctx: AsyncAPIContext
): CorrelationIdSource | undefined {
  if (message.correlationId) {
    if ('$ref' in message.correlationId) {
      const ref = (message.correlationId as ReferenceObject).$ref;
      const resolved = ctx.resolve<AsyncAPICorrelationIdObject>(ref);
      if (resolved) {
        return { ...resolved, ref };
      }
      return undefined;
    }
    return message.correlationId as AsyncAPICorrelationIdObject;
  }

  if (!message.traits || !Array.isArray(message.traits)) {
    return undefined;
  }

  let result: CorrelationIdSource | undefined;
  for (const traitRef of message.traits) {
    if (traitRef && '$ref' in traitRef) {
      const resolvedTrait = ctx.resolve<AsyncAPIMessageTraitObject>(
        traitRef.$ref
      );
      if (resolvedTrait?.correlationId) {
        if ('$ref' in resolvedTrait.correlationId) {
          const ref = (resolvedTrait.correlationId as ReferenceObject).$ref;
          const resolved = ctx.resolve<AsyncAPICorrelationIdObject>(ref);
          if (resolved) {
            result = { ...resolved, ref };
          }
        } else {
          result = resolvedTrait.correlationId as AsyncAPICorrelationIdObject;
        }
      }
    }
  }

  return result;
}

export function areAllPropertiesOptional(
  schema: SchemaObject | ReferenceObject,
  ctx: AsyncAPIContext
): boolean {
  if ('$ref' in schema) {
    const resolved = ctx.resolve<SchemaObject>(schema.$ref);
    if (!resolved) {
      return false;
    }
    return areAllPropertiesOptional(resolved, ctx);
  }

  if (!schema.properties || Object.keys(schema.properties).length === 0) {
    return true;
  }

  if (ctx.propertiesRequiredByDefault && schema.required === undefined) {
    return false;
  }

  if (schema.required && schema.required.length > 0) {
    return false;
  }

  if (ctx.defaultNonNullable) {
    for (const prop of Object.values(schema.properties)) {
      if (
        typeof prop === 'object' &&
        'default' in prop &&
        prop.default !== undefined
      ) {
        return false;
      }
    }
  }

  return true;
}

export default function transformMessageObject(
  message: AsyncAPIMessageObject,
  options: { path: string; ctx: AsyncAPIContext }
): ts.TypeNode {
  const { path, ctx } = options;
  const members: ts.TypeElement[] = [];

  if (message.name) {
    members.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex('name'),
        undefined,
        ts.factory.createLiteralTypeNode(
          ts.factory.createStringLiteral(message.name)
        )
      )
    );
  }

  if (message.payload) {
    let payloadType: ts.TypeNode;

    if ('$ref' in message.payload) {
      payloadType = oapiRef((message.payload as ReferenceObject).$ref);
    } else {
      payloadType = transformSchemaObject(message.payload as SchemaObject, {
        path: createRef([path, 'payload']),
        ctx,
      });
    }

    const payloadOptional = areAllPropertiesOptional(message.payload, ctx)
      ? QUESTION_TOKEN
      : undefined;

    members.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex('payload'),
        payloadOptional,
        payloadType
      )
    );
  }

  const headersSource = getHeadersSource(message, ctx);
  if (headersSource) {
    let headersType: ts.TypeNode;

    if (headersSource.traitRef) {
      const traitName = headersSource.traitRef.split('/').pop();
      if (traitName) {
        headersType = ts.factory.createIndexedAccessTypeNode(
          ts.factory.createIndexedAccessTypeNode(
            ts.factory.createIndexedAccessTypeNode(
              ts.factory.createTypeReferenceNode('components'),
              ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral('messageTraits')
              )
            ),
            ts.factory.createLiteralTypeNode(
              ts.factory.createStringLiteral(traitName)
            )
          ),
          ts.factory.createLiteralTypeNode(
            ts.factory.createStringLiteral('headers')
          )
        );
      } else {
        headersType = ts.factory.createKeywordTypeNode(
          ts.SyntaxKind.UnknownKeyword
        );
      }
    } else if ('$ref' in headersSource.headers) {
      headersType = oapiRef((headersSource.headers as ReferenceObject).$ref);
    } else {
      headersType = transformSchemaObject(
        headersSource.headers as SchemaObject,
        {
          path: createRef([path, 'headers']),
          ctx,
        }
      );
    }

    const headersOptional = areAllPropertiesOptional(headersSource.headers, ctx)
      ? QUESTION_TOKEN
      : undefined;

    members.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex('headers'),
        headersOptional,
        headersType
      )
    );
  }

  const contentType = getContentType(message, ctx);
  if (contentType) {
    members.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex('contentType'),
        undefined,
        ts.factory.createLiteralTypeNode(
          ts.factory.createStringLiteral(contentType)
        )
      )
    );
  }

  const correlationIdSource = getCorrelationIdSource(message, ctx);
  if (correlationIdSource) {
    const correlationType = correlationIdSource.ref
      ? transformLocationDescriptionValue(
          { $ref: correlationIdSource.ref },
          'correlationIds',
          ctx
        )
      : createLocationDescriptionType(correlationIdSource, ctx);

    members.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex('correlationId'),
        undefined,
        correlationType
      )
    );
  }

  return ts.factory.createTypeLiteralNode(members);
}
