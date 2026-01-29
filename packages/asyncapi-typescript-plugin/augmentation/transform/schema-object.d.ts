import type {
  ReferenceObject,
  SchemaObject,
  TransformNodeOptions,
} from '../types.js';
import ts from 'typescript';

export default function transformSchemaObject(
  schemaObject: SchemaObject | ReferenceObject,
  options: TransformNodeOptions
): ts.TypeNode;
export declare function transformSchemaObjectWithComposition(
  schemaObject: SchemaObject | ReferenceObject,
  options: TransformNodeOptions
): ts.TypeNode;
