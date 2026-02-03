import type {
  AsyncAPIContext,
  AsyncAPIServerObject,
  ReferenceObject,
} from '../types.js';
import {
  oapiRef,
  tsModifiers,
  tsPropertyIndex,
} from 'openapi-typescript/dist/lib/ts.js';
import { getEntries } from 'openapi-typescript/dist/lib/utils.js';
import ts from 'typescript';

export function transformServerObject(
  server: AsyncAPIServerObject,
  ctx: AsyncAPIContext
): ts.TypeNode {
  const members: ts.TypeElement[] = [];

  if (server.host) {
    members.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex('host'),
        undefined,
        ts.factory.createLiteralTypeNode(
          ts.factory.createStringLiteral(server.host)
        )
      )
    );
  }

  if (server.protocol) {
    members.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex('protocol'),
        undefined,
        ts.factory.createLiteralTypeNode(
          ts.factory.createStringLiteral(server.protocol)
        )
      )
    );
  }

  if (server.protocolVersion) {
    members.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex('protocolVersion'),
        undefined,
        ts.factory.createLiteralTypeNode(
          ts.factory.createStringLiteral(server.protocolVersion)
        )
      )
    );
  }

  if (server.pathname) {
    members.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex('pathname'),
        undefined,
        ts.factory.createLiteralTypeNode(
          ts.factory.createStringLiteral(server.pathname)
        )
      )
    );
  }

  if (server.description) {
    members.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex('description'),
        undefined,
        ts.factory.createLiteralTypeNode(
          ts.factory.createStringLiteral(server.description)
        )
      )
    );
  }

  return ts.factory.createTypeLiteralNode(members);
}

export default function transformServersObject(
  ctx: AsyncAPIContext
): ts.TypeNode {
  const serversObj = ctx.rawSchema.servers as
    | Record<string, AsyncAPIServerObject | ReferenceObject>
    | undefined;

  if (!serversObj || typeof serversObj !== 'object') {
    return ts.factory.createTypeLiteralNode([]);
  }

  const members: ts.TypeElement[] = [];

  for (const [serverId, server] of getEntries(serversObj, ctx)) {
    if (!server || typeof server !== 'object') {
      continue;
    }

    let serverType: ts.TypeNode;

    if ('$ref' in server) {
      serverType = oapiRef((server as ReferenceObject).$ref);
    } else {
      serverType = transformServerObject(server as AsyncAPIServerObject, ctx);
    }

    members.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex(serverId),
        undefined,
        serverType
      )
    );
  }

  return ts.factory.createTypeLiteralNode(members);
}
