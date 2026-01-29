import type { RequestBodyObject, TransformNodeOptions } from '../types.js';
import ts from 'typescript';

export default function transformRequestBodyObject(
  requestBodyObject: RequestBodyObject,
  options: TransformNodeOptions
): ts.TypeNode;
