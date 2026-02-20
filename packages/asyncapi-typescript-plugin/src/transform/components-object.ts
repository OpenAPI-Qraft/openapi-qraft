import type {
  AsyncAPIComponentsObject,
  AsyncAPIContext,
  AsyncAPICorrelationIdObject,
  AsyncAPIMessageObject,
  AsyncAPIParameterObject,
  AsyncAPIReplyAddressObject,
  AsyncAPIServerObject,
  ReferenceObject,
  SchemaObject,
} from '../types.js';
import { performance } from 'node:perf_hooks';
import {
  addJSDocComment,
  NEVER,
  QUESTION_TOKEN,
  tsModifiers,
  tsPropertyIndex,
} from 'openapi-typescript/dist/lib/ts.js';
import {
  createRef,
  debug,
  getEntries,
} from 'openapi-typescript/dist/lib/utils.js';
import ts from 'typescript';
import {
  createLocationDescriptionType,
  transformLocationDescriptionValue,
} from './location-description.js';
import transformMessageObject, {
  areAllPropertiesOptional,
} from './messages-object.js';
import transformSchemaObject from './schema-object.js';
import { transformServerObject } from './servers-object.js';

export default function transformComponentsObject(
  ctx: AsyncAPIContext
): ts.TypeNode {
  const componentsObj = ctx.rawSchema.components as
    | AsyncAPIComponentsObject
    | undefined;

  if (!componentsObj || typeof componentsObj !== 'object') {
    return ts.factory.createTypeLiteralNode([]);
  }

  const type: ts.TypeElement[] = [];

  const schemasT = performance.now();
  const schemasItems = transformSchemas(componentsObj.schemas, ctx);
  type.push(
    ts.factory.createPropertySignature(
      undefined,
      tsPropertyIndex('schemas'),
      undefined,
      schemasItems.length > 0
        ? ts.factory.createTypeLiteralNode(schemasItems)
        : NEVER
    )
  );
  debug(
    'Transformed components → schemas',
    'asyncapi',
    performance.now() - schemasT
  );

  const messagesT = performance.now();
  const messagesItems = transformMessages(componentsObj.messages, ctx);
  type.push(
    ts.factory.createPropertySignature(
      undefined,
      tsPropertyIndex('messages'),
      undefined,
      messagesItems.length > 0
        ? ts.factory.createTypeLiteralNode(messagesItems)
        : NEVER
    )
  );
  debug(
    'Transformed components → messages',
    'asyncapi',
    performance.now() - messagesT
  );

  const parametersT = performance.now();
  const parametersItems = transformParameters(componentsObj.parameters, ctx);
  type.push(
    ts.factory.createPropertySignature(
      undefined,
      tsPropertyIndex('parameters'),
      undefined,
      parametersItems.length > 0
        ? ts.factory.createTypeLiteralNode(parametersItems)
        : NEVER
    )
  );
  debug(
    'Transformed components → parameters',
    'asyncapi',
    performance.now() - parametersT
  );

  const securitySchemesT = performance.now();
  const securitySchemesItems = transformSecuritySchemes(
    componentsObj.securitySchemes,
    ctx
  );
  type.push(
    ts.factory.createPropertySignature(
      undefined,
      tsPropertyIndex('securitySchemes'),
      undefined,
      securitySchemesItems.length > 0
        ? ts.factory.createTypeLiteralNode(securitySchemesItems)
        : NEVER
    )
  );
  debug(
    'Transformed components → securitySchemes',
    'asyncapi',
    performance.now() - securitySchemesT
  );

  const serversT = performance.now();
  const serversItems = transformServers(componentsObj.servers, ctx);
  type.push(
    ts.factory.createPropertySignature(
      undefined,
      tsPropertyIndex('servers'),
      undefined,
      serversItems.length > 0
        ? ts.factory.createTypeLiteralNode(serversItems)
        : NEVER
    )
  );
  debug(
    'Transformed components → servers',
    'asyncapi',
    performance.now() - serversT
  );

  const messageTraitsT = performance.now();
  const messageTraitsItems = transformMessageTraits(
    componentsObj.messageTraits,
    ctx
  );
  type.push(
    ts.factory.createPropertySignature(
      undefined,
      tsPropertyIndex('messageTraits'),
      undefined,
      messageTraitsItems.length > 0
        ? ts.factory.createTypeLiteralNode(messageTraitsItems)
        : NEVER
    )
  );
  debug(
    'Transformed components → messageTraits',
    'asyncapi',
    performance.now() - messageTraitsT
  );

  const operationTraitsT = performance.now();
  const operationTraitsItems = transformOperationTraits(
    componentsObj.operationTraits,
    ctx
  );
  type.push(
    ts.factory.createPropertySignature(
      undefined,
      tsPropertyIndex('operationTraits'),
      undefined,
      operationTraitsItems.length > 0
        ? ts.factory.createTypeLiteralNode(operationTraitsItems)
        : NEVER
    )
  );
  debug(
    'Transformed components → operationTraits',
    'asyncapi',
    performance.now() - operationTraitsT
  );

  const replyAddressesT = performance.now();
  const replyAddressesItems = transformReplyAddresses(
    componentsObj.replyAddresses,
    ctx
  );
  type.push(
    ts.factory.createPropertySignature(
      undefined,
      tsPropertyIndex('replyAddresses'),
      undefined,
      replyAddressesItems.length > 0
        ? ts.factory.createTypeLiteralNode(replyAddressesItems)
        : NEVER
    )
  );
  debug(
    'Transformed components → replyAddresses',
    'asyncapi',
    performance.now() - replyAddressesT
  );

  const correlationIdsT = performance.now();
  const correlationIdsItems = transformCorrelationIds(
    componentsObj.correlationIds,
    ctx
  );
  type.push(
    ts.factory.createPropertySignature(
      undefined,
      tsPropertyIndex('correlationIds'),
      undefined,
      correlationIdsItems.length > 0
        ? ts.factory.createTypeLiteralNode(correlationIdsItems)
        : NEVER
    )
  );
  debug(
    'Transformed components → correlationIds',
    'asyncapi',
    performance.now() - correlationIdsT
  );

  return ts.factory.createTypeLiteralNode(type);
}

function transformSchemas(
  schemas: Record<string, SchemaObject> | undefined,
  ctx: AsyncAPIContext
): ts.TypeElement[] {
  const items: ts.TypeElement[] = [];

  if (!schemas || typeof schemas !== 'object') {
    return items;
  }

  for (const [name, schema] of getEntries<SchemaObject>(schemas, ctx)) {
    const subType = transformSchemaObject(schema, {
      path: createRef(['components', 'schemas', name]),
      schema,
      ctx,
    });

    let hasQuestionToken = false;
    if (ctx.transform) {
      const result = ctx.transform(schema, {
        path: createRef(['components', 'schemas', name]),
        schema,
        ctx,
      } as any);
      if (result && 'questionToken' in result) {
        hasQuestionToken = result.questionToken;
      }
    }

    const property = ts.factory.createPropertySignature(
      tsModifiers({ readonly: ctx.immutable }),
      tsPropertyIndex(name),
      hasQuestionToken ? QUESTION_TOKEN : undefined,
      subType
    );
    addJSDocComment(schema as unknown as any, property);
    items.push(property);
  }

  return items;
}

function transformMessages(
  messages: Record<string, AsyncAPIMessageObject> | undefined,
  ctx: AsyncAPIContext
): ts.TypeElement[] {
  const items: ts.TypeElement[] = [];

  if (!messages || typeof messages !== 'object') {
    return items;
  }

  for (const [name, message] of getEntries<AsyncAPIMessageObject>(
    messages,
    ctx
  )) {
    const subType = transformMessageObject(message, {
      path: createRef(['components', 'messages', name]),
      ctx,
    });

    const property = ts.factory.createPropertySignature(
      tsModifiers({ readonly: ctx.immutable }),
      tsPropertyIndex(name),
      undefined,
      subType
    );
    addJSDocComment(message as unknown as any, property);
    items.push(property);
  }

  return items;
}

function transformParameters(
  parameters: Record<string, AsyncAPIParameterObject> | undefined,
  ctx: AsyncAPIContext
): ts.TypeElement[] {
  const items: ts.TypeElement[] = [];

  if (!parameters || typeof parameters !== 'object') {
    return items;
  }

  for (const [name, param] of getEntries<AsyncAPIParameterObject>(
    parameters,
    ctx
  )) {
    const members: ts.TypeElement[] = [];

    if (param.location) {
      members.push(
        ts.factory.createPropertySignature(
          tsModifiers({ readonly: ctx.immutable }),
          tsPropertyIndex('location'),
          undefined,
          ts.factory.createLiteralTypeNode(
            ts.factory.createStringLiteral(param.location)
          )
        )
      );
    }

    if (param.schema) {
      let schemaType: ts.TypeNode;
      if ('$ref' in param.schema) {
        schemaType = ts.factory.createIndexedAccessTypeNode(
          ts.factory.createIndexedAccessTypeNode(
            ts.factory.createTypeReferenceNode('components'),
            ts.factory.createLiteralTypeNode(
              ts.factory.createStringLiteral('schemas')
            )
          ),
          ts.factory.createLiteralTypeNode(
            ts.factory.createStringLiteral(
              param.schema.$ref.split('/').pop() ?? ''
            )
          )
        );
      } else {
        schemaType = transformSchemaObject(param.schema as SchemaObject, {
          path: createRef(['components', 'parameters', name, 'schema']),
          ctx,
        });
      }

      members.push(
        ts.factory.createPropertySignature(
          tsModifiers({ readonly: ctx.immutable }),
          tsPropertyIndex('schema'),
          undefined,
          schemaType
        )
      );
    }

    const property = ts.factory.createPropertySignature(
      tsModifiers({ readonly: ctx.immutable }),
      tsPropertyIndex(name),
      undefined,
      members.length > 0
        ? ts.factory.createTypeLiteralNode(members)
        : ts.factory.createTypeLiteralNode([])
    );
    addJSDocComment(param as unknown as any, property);
    items.push(property);
  }

  return items;
}

function transformSecuritySchemes(
  securitySchemes: Record<string, unknown> | undefined,
  ctx: AsyncAPIContext
): ts.TypeElement[] {
  const items: ts.TypeElement[] = [];

  if (!securitySchemes || typeof securitySchemes !== 'object') {
    return items;
  }

  for (const [name, scheme] of Object.entries(securitySchemes)) {
    if (!scheme || typeof scheme !== 'object') {
      continue;
    }

    const schemeObj = scheme as Record<string, unknown>;
    const members: ts.TypeElement[] = [];

    if (schemeObj.type && typeof schemeObj.type === 'string') {
      members.push(
        ts.factory.createPropertySignature(
          tsModifiers({ readonly: ctx.immutable }),
          tsPropertyIndex('type'),
          undefined,
          ts.factory.createLiteralTypeNode(
            ts.factory.createStringLiteral(schemeObj.type)
          )
        )
      );
    }

    if (schemeObj.description && typeof schemeObj.description === 'string') {
      members.push(
        ts.factory.createPropertySignature(
          tsModifiers({ readonly: ctx.immutable }),
          tsPropertyIndex('description'),
          undefined,
          ts.factory.createLiteralTypeNode(
            ts.factory.createStringLiteral(schemeObj.description)
          )
        )
      );
    }

    items.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex(name),
        undefined,
        ts.factory.createTypeLiteralNode(members)
      )
    );
  }

  return items;
}

function transformServers(
  servers: Record<string, AsyncAPIServerObject | ReferenceObject> | undefined,
  ctx: AsyncAPIContext
): ts.TypeElement[] {
  const items: ts.TypeElement[] = [];

  if (!servers || typeof servers !== 'object') {
    return items;
  }

  for (const [name, server] of Object.entries(servers)) {
    if (!server || typeof server !== 'object') {
      continue;
    }

    let serverType: ts.TypeNode;

    if ('$ref' in server) {
      const refParts = (server as ReferenceObject).$ref.split('/');
      const serverName = refParts.pop() ?? '';
      serverType = ts.factory.createIndexedAccessTypeNode(
        ts.factory.createIndexedAccessTypeNode(
          ts.factory.createTypeReferenceNode('components'),
          ts.factory.createLiteralTypeNode(
            ts.factory.createStringLiteral('servers')
          )
        ),
        ts.factory.createLiteralTypeNode(
          ts.factory.createStringLiteral(serverName)
        )
      );
    } else {
      serverType = transformServerObject(server as AsyncAPIServerObject, ctx);
    }

    const property = ts.factory.createPropertySignature(
      tsModifiers({ readonly: ctx.immutable }),
      tsPropertyIndex(name),
      undefined,
      serverType
    );
    items.push(property);
  }

  return items;
}

function transformMessageTraits(
  messageTraits: Record<string, unknown> | undefined,
  ctx: AsyncAPIContext
): ts.TypeElement[] {
  const items: ts.TypeElement[] = [];

  if (!messageTraits || typeof messageTraits !== 'object') {
    return items;
  }

  for (const [name, trait] of Object.entries(messageTraits)) {
    if (!trait || typeof trait !== 'object') {
      continue;
    }

    const traitObj = trait as Record<string, unknown>;
    const members: ts.TypeElement[] = [];

    if (traitObj.headers && typeof traitObj.headers === 'object') {
      const headersType = transformSchemaObject(
        traitObj.headers as SchemaObject,
        {
          path: createRef(['components', 'messageTraits', name, 'headers']),
          ctx,
        }
      );

      const headersOptional = areAllPropertiesOptional(
        traitObj.headers as SchemaObject,
        ctx
      )
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

    if (traitObj.correlationId && typeof traitObj.correlationId === 'object') {
      const correlationType = transformLocationDescriptionValue(
        traitObj.correlationId as AsyncAPICorrelationIdObject | ReferenceObject,
        'correlationIds',
        ctx
      );

      members.push(
        ts.factory.createPropertySignature(
          tsModifiers({ readonly: ctx.immutable }),
          tsPropertyIndex('correlationId'),
          undefined,
          correlationType
        )
      );
    }

    items.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex(name),
        undefined,
        ts.factory.createTypeLiteralNode(members)
      )
    );
  }

  return items;
}

function transformOperationTraits(
  operationTraits: Record<string, unknown> | undefined,
  ctx: AsyncAPIContext
): ts.TypeElement[] {
  const items: ts.TypeElement[] = [];

  if (!operationTraits || typeof operationTraits !== 'object') {
    return items;
  }

  for (const [name, trait] of Object.entries(operationTraits)) {
    if (!trait || typeof trait !== 'object') {
      continue;
    }

    const traitObj = trait as Record<string, unknown>;
    const members: ts.TypeElement[] = [];

    if (traitObj.bindings && typeof traitObj.bindings === 'object') {
      members.push(
        ts.factory.createPropertySignature(
          tsModifiers({ readonly: ctx.immutable }),
          tsPropertyIndex('bindings'),
          undefined,
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
        )
      );
    }

    items.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex(name),
        undefined,
        ts.factory.createTypeLiteralNode(members)
      )
    );
  }

  return items;
}

function transformReplyAddresses(
  replyAddresses: Record<string, AsyncAPIReplyAddressObject> | undefined,
  ctx: AsyncAPIContext
): ts.TypeElement[] {
  const items: ts.TypeElement[] = [];

  if (!replyAddresses || typeof replyAddresses !== 'object') {
    return items;
  }

  for (const [name, address] of Object.entries(replyAddresses)) {
    if (!address || typeof address !== 'object') {
      continue;
    }

    const property = ts.factory.createPropertySignature(
      tsModifiers({ readonly: ctx.immutable }),
      tsPropertyIndex(name),
      undefined,
      createLocationDescriptionType(address, ctx)
    );
    addJSDocComment(address as unknown as any, property);
    items.push(property);
  }

  return items;
}

function transformCorrelationIds(
  correlationIds: Record<string, AsyncAPICorrelationIdObject> | undefined,
  ctx: AsyncAPIContext
): ts.TypeElement[] {
  const items: ts.TypeElement[] = [];

  if (!correlationIds || typeof correlationIds !== 'object') {
    return items;
  }

  for (const [name, correlationId] of Object.entries(correlationIds)) {
    if (!correlationId || typeof correlationId !== 'object') {
      continue;
    }

    const property = ts.factory.createPropertySignature(
      tsModifiers({ readonly: ctx.immutable }),
      tsPropertyIndex(name),
      undefined,
      createLocationDescriptionType(correlationId, ctx)
    );
    addJSDocComment(correlationId as unknown as any, property);
    items.push(property);
  }

  return items;
}
