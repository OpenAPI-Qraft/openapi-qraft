import type { GlobalContext, PathsObject } from '../types.js';
import ts from 'typescript';

export default function transformPathsObject(
  pathsObject: PathsObject,
  ctx: GlobalContext
): ts.TypeNode;
