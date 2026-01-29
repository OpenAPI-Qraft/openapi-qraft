import type {
  AsyncAPIContext,
  AsyncAPIOperationObject,
  AsyncAPIReplyAddressObject,
  ReferenceObject,
} from '../types.js';
import {
  oapiRef,
  tsLiteral,
  tsModifiers,
  tsPropertyIndex,
  tsUnion,
} from 'openapi-typescript/dist/lib/ts.js';
import { getEntries } from 'openapi-typescript/dist/lib/utils.js';
import ts from 'typescript';
import { transformLocationDescriptionValue } from './location-description.js';

export default function transformOperationsObject(
  ctx: AsyncAPIContext
): ts.TypeNode {
  const operationsObj = ctx.rawSchema.operations as
    | Record<string, AsyncAPIOperationObject>
    | undefined;

  if (!operationsObj || typeof operationsObj !== 'object') {
    return ts.factory.createTypeLiteralNode([]);
  }

  const members: ts.TypeElement[] = [];

  for (const [operationId, operation] of getEntries(operationsObj, ctx)) {
    if (!operation || typeof operation !== 'object') {
      continue;
    }

    const operationMembers: ts.TypeElement[] = [];

    if (operation.action) {
      operationMembers.push(
        ts.factory.createPropertySignature(
          tsModifiers({ readonly: ctx.immutable }),
          tsPropertyIndex('action'),
          undefined,
          tsLiteral(operation.action)
        )
      );
    }

    if (operation.channel && '$ref' in operation.channel) {
      const channelRef = (operation.channel as ReferenceObject).$ref;
      const channelId = channelRef.split('/').pop();

      if (channelId) {
        operationMembers.push(
          ts.factory.createPropertySignature(
            tsModifiers({ readonly: ctx.immutable }),
            tsPropertyIndex('channel'),
            undefined,
            ts.factory.createIndexedAccessTypeNode(
              ts.factory.createTypeReferenceNode('channels'),
              ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral(channelId)
              )
            )
          )
        );
      }
    }

    if (operation.messages && Array.isArray(operation.messages)) {
      const messageTypes: ts.TypeNode[] = [];

      for (const message of operation.messages) {
        if (message && '$ref' in message) {
          messageTypes.push(oapiRef((message as ReferenceObject).$ref));
        }
      }

      if (messageTypes.length > 0) {
        operationMembers.push(
          ts.factory.createPropertySignature(
            tsModifiers({ readonly: ctx.immutable }),
            tsPropertyIndex('messages'),
            undefined,
            ts.factory.createTupleTypeNode(messageTypes)
          )
        );
      }
    }

    if (operation.reply) {
      const replyMembers: ts.TypeElement[] = [];

      if (operation.reply.address) {
        const addressType = transformLocationDescriptionValue(
          operation.reply.address as
            | AsyncAPIReplyAddressObject
            | ReferenceObject,
          'replyAddresses',
          ctx
        );

        replyMembers.push(
          ts.factory.createPropertySignature(
            tsModifiers({ readonly: ctx.immutable }),
            tsPropertyIndex('address'),
            undefined,
            addressType
          )
        );
      }

      if (operation.reply.channel && '$ref' in operation.reply.channel) {
        const replyChannelRef = (operation.reply.channel as ReferenceObject)
          .$ref;
        const replyChannelId = replyChannelRef.split('/').pop();

        if (replyChannelId) {
          replyMembers.push(
            ts.factory.createPropertySignature(
              tsModifiers({ readonly: ctx.immutable }),
              tsPropertyIndex('channel'),
              undefined,
              ts.factory.createIndexedAccessTypeNode(
                ts.factory.createTypeReferenceNode('channels'),
                ts.factory.createLiteralTypeNode(
                  ts.factory.createStringLiteral(replyChannelId)
                )
              )
            )
          );
        }
      }

      if (operation.reply.messages && Array.isArray(operation.reply.messages)) {
        const replyMessageTypes: ts.TypeNode[] = [];

        for (const message of operation.reply.messages) {
          if (message && '$ref' in message) {
            replyMessageTypes.push(oapiRef((message as ReferenceObject).$ref));
          }
        }

        if (replyMessageTypes.length > 0) {
          replyMembers.push(
            ts.factory.createPropertySignature(
              tsModifiers({ readonly: ctx.immutable }),
              tsPropertyIndex('messages'),
              undefined,
              ts.factory.createTupleTypeNode(replyMessageTypes)
            )
          );
        }
      }

      if (replyMembers.length > 0) {
        operationMembers.push(
          ts.factory.createPropertySignature(
            tsModifiers({ readonly: ctx.immutable }),
            tsPropertyIndex('reply'),
            undefined,
            ts.factory.createTypeLiteralNode(replyMembers)
          )
        );
      }
    }

    if (operation.summary) {
      operationMembers.push(
        ts.factory.createPropertySignature(
          tsModifiers({ readonly: ctx.immutable }),
          tsPropertyIndex('summary'),
          undefined,
          tsLiteral(operation.summary)
        )
      );
    }

    members.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex(operationId),
        undefined,
        ts.factory.createTypeLiteralNode(operationMembers)
      )
    );
  }

  return ts.factory.createTypeLiteralNode(members);
}
