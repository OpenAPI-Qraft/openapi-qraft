import type { GlobalContext, OpenAPI3 } from '../types.js';
import ts from 'typescript';

export default function transformSchema(
  schema: OpenAPI3,
  ctx: GlobalContext
): ts.Node[];
