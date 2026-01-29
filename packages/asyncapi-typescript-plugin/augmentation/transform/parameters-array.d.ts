import type {
  ParameterObject,
  ReferenceObject,
  TransformNodeOptions,
} from '../types.js';
import ts from 'typescript';

export declare function transformParametersArray(
  parametersArray: (ParameterObject | ReferenceObject)[],
  options: TransformNodeOptions
): ts.TypeElement[];
