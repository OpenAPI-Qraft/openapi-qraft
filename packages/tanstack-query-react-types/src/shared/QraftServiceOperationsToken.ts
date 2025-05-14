/**
 * A unique symbol that exists only at type-level and is used for type inference of services.
 * This symbol does not exist at runtime and cannot be accessed or used for data operations.
 * It serves purely as a TypeScript type mechanism to infer and enforce correct service types
 * when services are passed as variables in the type system.
 */
export declare const QraftServiceOperationsToken: unique symbol;
export type QraftServiceOperationsToken = typeof QraftServiceOperationsToken;
