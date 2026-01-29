import type { GlobalContext, WebhooksObject } from '../types.js';
import ts from 'typescript';

export default function transformWebhooksObject(
  webhooksObject: WebhooksObject,
  options: GlobalContext
): ts.TypeNode;
