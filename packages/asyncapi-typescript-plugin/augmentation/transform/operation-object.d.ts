import type { OperationObject, TransformNodeOptions } from '../types.js';
import ts from 'typescript';

export default function transformOperationObject(
  operationObject: OperationObject,
  options: TransformNodeOptions
): ts.TypeElement[];
export declare function injectOperationObject(
  operationId: string,
  operationObject: OperationObject,
  options: TransformNodeOptions
): void;
