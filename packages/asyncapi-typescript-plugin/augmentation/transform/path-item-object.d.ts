import type { PathItemObject, TransformNodeOptions } from '../types.js';
import ts from 'typescript';

export type Method =
  | 'get'
  | 'put'
  | 'post'
  | 'delete'
  | 'options'
  | 'head'
  | 'patch'
  | 'trace';
export default function transformPathItemObject(
  pathItem: PathItemObject,
  options: TransformNodeOptions
): ts.TypeNode;
