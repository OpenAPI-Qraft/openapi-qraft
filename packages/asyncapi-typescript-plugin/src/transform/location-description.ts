import type { AsyncAPIContext, ReferenceObject } from '../types.js';
import {
  tsModifiers,
  tsPropertyIndex,
} from 'openapi-typescript/dist/lib/ts.js';
import ts from 'typescript';

export interface LocationDescriptionObject {
  location?: string;
  description?: string;
}

export function createLocationDescriptionType(
  obj: LocationDescriptionObject,
  ctx: AsyncAPIContext
): ts.TypeNode {
  const members: ts.TypeElement[] = [];

  if (obj.location) {
    members.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex('location'),
        undefined,
        ts.factory.createLiteralTypeNode(
          ts.factory.createStringLiteral(obj.location)
        )
      )
    );
  }

  if (obj.description) {
    members.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex('description'),
        undefined,
        ts.factory.createLiteralTypeNode(
          ts.factory.createStringLiteral(obj.description)
        )
      )
    );
  }

  return ts.factory.createTypeLiteralNode(members);
}

export function transformLocationDescriptionValue(
  obj: LocationDescriptionObject | ReferenceObject,
  componentKey: 'correlationIds' | 'replyAddresses',
  ctx: AsyncAPIContext
): ts.TypeNode {
  if ('$ref' in obj) {
    const name = obj.$ref.split('/').pop();
    if (name) {
      return ts.factory.createIndexedAccessTypeNode(
        ts.factory.createIndexedAccessTypeNode(
          ts.factory.createTypeReferenceNode('components'),
          ts.factory.createLiteralTypeNode(
            ts.factory.createStringLiteral(componentKey)
          )
        ),
        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(name))
      );
    }
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
  }

  return createLocationDescriptionType(obj, ctx);
}
