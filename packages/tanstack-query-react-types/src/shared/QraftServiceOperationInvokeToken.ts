/**
 * A unique symbol that exists only at type-level and is used for type inference of service operation invocation.
 * This symbol does not exist at runtime and cannot be accessed or used for data operations.
 * It serves purely as a TypeScript type mechanism to infer and enforce correct operation invocation types
 * when service operations are passed as variables in the type system.
 */
export declare const QraftServiceOperationInvokeToken: unique symbol;
export type QraftServiceOperationInvokeToken =
  typeof QraftServiceOperationInvokeToken;
