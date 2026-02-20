import type {
  AsyncAPIChannelObject,
  AsyncAPIContext,
  AsyncAPIParameterObject,
  ReferenceObject,
} from '../types.js';
import {
  NEVER,
  oapiRef,
  tsLiteral,
  tsModifiers,
  tsPropertyIndex,
  tsUnion,
} from 'openapi-typescript/dist/lib/ts.js';
import { getEntries } from 'openapi-typescript/dist/lib/utils.js';
import ts from 'typescript';

export default function transformChannelsObject(
  ctx: AsyncAPIContext
): ts.TypeNode {
  const channelsObj = ctx.rawSchema.channels as
    | Record<string, AsyncAPIChannelObject>
    | undefined;

  if (!channelsObj || typeof channelsObj !== 'object') {
    return ts.factory.createTypeLiteralNode([]);
  }

  const members: ts.TypeElement[] = [];

  for (const [channelId, channel] of getEntries(channelsObj, ctx)) {
    if (!channel || typeof channel !== 'object') {
      continue;
    }

    const channelMembers: ts.TypeElement[] = [];

    if (channel.address !== undefined) {
      channelMembers.push(
        ts.factory.createPropertySignature(
          tsModifiers({ readonly: ctx.immutable }),
          tsPropertyIndex('address'),
          undefined,
          tsLiteral(channel.address)
        )
      );
    }

    if (channel.messages && typeof channel.messages === 'object') {
      const messageMembers: ts.TypeElement[] = [];

      for (const [messageId, message] of Object.entries(channel.messages)) {
        let messageType: ts.TypeNode;

        if (message && '$ref' in message) {
          messageType = oapiRef((message as ReferenceObject).$ref);
        } else {
          messageType = ts.factory.createKeywordTypeNode(
            ts.SyntaxKind.UnknownKeyword
          );
        }

        messageMembers.push(
          ts.factory.createPropertySignature(
            tsModifiers({ readonly: ctx.immutable }),
            tsPropertyIndex(messageId),
            undefined,
            messageType
          )
        );
      }

      channelMembers.push(
        ts.factory.createPropertySignature(
          tsModifiers({ readonly: ctx.immutable }),
          tsPropertyIndex('messages'),
          undefined,
          messageMembers.length > 0
            ? ts.factory.createTypeLiteralNode(messageMembers)
            : NEVER
        )
      );
    }

    if (channel.parameters && typeof channel.parameters === 'object') {
      const paramMembers: ts.TypeElement[] = [];

      for (const [paramId, param] of Object.entries(channel.parameters)) {
        paramMembers.push(
          ts.factory.createPropertySignature(
            tsModifiers({ readonly: ctx.immutable }),
            tsPropertyIndex(paramId),
            undefined,
            transformChannelParameterType(
              param as AsyncAPIParameterObject | ReferenceObject,
              ctx
            )
          )
        );
      }

      channelMembers.push(
        ts.factory.createPropertySignature(
          tsModifiers({ readonly: ctx.immutable }),
          tsPropertyIndex('parameters'),
          undefined,
          paramMembers.length > 0
            ? ts.factory.createTypeLiteralNode(paramMembers)
            : NEVER
        )
      );
    }

    if (channel.servers && Array.isArray(channel.servers)) {
      const serverTypes: ts.TypeNode[] = [];

      for (const serverRef of channel.servers) {
        if (serverRef && '$ref' in serverRef) {
          const ref = (serverRef as ReferenceObject).$ref;
          const serverId = ref.split('/').pop();

          if (serverId) {
            serverTypes.push(
              ts.factory.createIndexedAccessTypeNode(
                ts.factory.createTypeReferenceNode('servers'),
                ts.factory.createLiteralTypeNode(
                  ts.factory.createStringLiteral(serverId)
                )
              )
            );
          }
        }
      }

      if (serverTypes.length > 0) {
        channelMembers.push(
          ts.factory.createPropertySignature(
            tsModifiers({ readonly: ctx.immutable }),
            tsPropertyIndex('servers'),
            undefined,
            ts.factory.createTupleTypeNode(serverTypes)
          )
        );
      }
    }

    members.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex(channelId),
        undefined,
        ts.factory.createTypeLiteralNode(channelMembers)
      )
    );
  }

  return ts.factory.createTypeLiteralNode(members);
}

function transformChannelParameterType(
  parameter: AsyncAPIParameterObject | ReferenceObject,
  ctx: AsyncAPIContext
): ts.TypeNode {
  const parameterObject =
    '$ref' in parameter
      ? ctx.resolve<AsyncAPIParameterObject>(parameter.$ref)
      : parameter;

  const enumValues =
    parameterObject?.enum?.filter(
      (value): value is string => typeof value === 'string'
    ) ?? [];

  if (enumValues.length > 0) {
    return tsUnion(enumValues.map(tsLiteral));
  }

  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
}
