import type { ComponentsObject, GlobalContext } from '../types.js';
import ts from 'typescript';

export default function transformComponentsObject(
  componentsObject: ComponentsObject,
  ctx: GlobalContext
): ts.Node[];
export declare function singularizeComponentKey(
  key:
    | `x-${string}`
    | 'schemas'
    | 'responses'
    | 'parameters'
    | 'requestBodies'
    | 'headers'
    | 'pathItems'
): string;
