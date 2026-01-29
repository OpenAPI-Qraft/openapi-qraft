import type { ResponsesObject, TransformNodeOptions } from '../types.js';
import ts from 'typescript';

export default function transformResponsesObject(
  responsesObject: ResponsesObject,
  options: TransformNodeOptions
): ts.TypeNode;
