import type { HeaderObject, TransformNodeOptions } from '../types.js';
import ts from 'typescript';

export default function transformHeaderObject(
  headerObject: HeaderObject,
  options: TransformNodeOptions
): ts.TypeNode;
