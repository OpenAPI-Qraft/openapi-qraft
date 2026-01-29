import type { ResponseObject, TransformNodeOptions } from '../types.js';
import ts from 'typescript';

export default function transformResponseObject(
  responseObject: ResponseObject,
  options: TransformNodeOptions
): ts.TypeNode;
