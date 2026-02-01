import type { AsyncAPIContext } from '../types.js';
import { performance } from 'node:perf_hooks';
import {
  NEVER,
  STRING,
  tsModifiers,
  tsRecord,
} from 'openapi-typescript/dist/lib/ts.js';
import { debug } from 'openapi-typescript/dist/lib/utils.js';
import ts from 'typescript';
import transformChannelsObject from './channels-object.js';
import transformComponentsObject from './components-object.js';
import transformOperationsObject from './operations-object.js';
import transformServersObject from './servers-object.js';

type AsyncAPIRootKeys = 'servers' | 'channels' | 'operations' | 'components';

const transformers: Record<
  AsyncAPIRootKeys,
  (ctx: AsyncAPIContext) => ts.TypeNode
> = {
  servers: transformServersObject,
  channels: transformChannelsObject,
  operations: transformOperationsObject,
  components: transformComponentsObject,
};

export default function transformAsyncAPISchema(
  ctx: AsyncAPIContext
): ts.Node[] {
  const type: ts.Node[] = [];

  for (const root of Object.keys(transformers) as AsyncAPIRootKeys[]) {
    const emptyObj = ts.factory.createTypeAliasDeclaration(
      tsModifiers({ export: true }),
      root,
      undefined,
      tsRecord(STRING, NEVER)
    );

    const rootT = performance.now();
    const subType = transformers[root](ctx);

    if (ts.isTypeLiteralNode(subType) && subType.members.length > 0) {
      type.push(
        ctx.exportType
          ? ts.factory.createTypeAliasDeclaration(
              tsModifiers({ export: true }),
              root,
              undefined,
              subType
            )
          : ts.factory.createInterfaceDeclaration(
              tsModifiers({ export: true }),
              root,
              undefined,
              undefined,
              subType.members
            )
      );
      debug(`${root} done`, 'asyncapi', performance.now() - rootT);
    } else if (ts.isTypeAliasDeclaration(subType)) {
      type.push(subType);
      debug(`${root} done`, 'asyncapi', performance.now() - rootT);
    } else {
      type.push(emptyObj);
      debug(`${root} done (skipped)`, 'asyncapi', 0);
    }
  }

  for (const injectedType of ctx.injectFooter) {
    type.push(injectedType);
  }

  return type;
}
