/**
 * This file was auto-generated by @openapi-qraft/cli.
 * Do not make direct changes to the file.
 */

import type { APIBasicClientServices, APIBasicQueryClientServices, APIDefaultQueryClientServices, APIQueryClientServices, APIUtilityClientServices, CreateAPIBasicClientOptions, CreateAPIBasicQueryClientOptions, CreateAPIClientOptions, CreateAPIQueryClientOptions, UnionServiceOperationsDeclaration } from "@openapi-qraft/react";
import type * as allCallbacks from "@openapi-qraft/react/callbacks/index";
import { qraftAPIClient } from "@openapi-qraft/react";
import { useQuery, useMutation } from "@openapi-qraft/react/callbacks/index";
const defaultCallbacks = {
    useQuery,
    useMutation
} as const;
export function createAPIOperationClient<Services extends UnionServiceOperationsDeclaration<Services>>(services: Services, options: CreateAPIQueryClientOptions, callbacks: AllCallbacks): APIDefaultQueryClientServices<Services>;
export function createAPIOperationClient<Services extends UnionServiceOperationsDeclaration<Services>, Callbacks extends Partial<AllCallbacks> = DefaultCallbacks>(services: Services, options: CreateAPIQueryClientOptions, callbacks?: Callbacks): APIQueryClientServices<Services, Callbacks>;
export function createAPIOperationClient<Services extends UnionServiceOperationsDeclaration<Services>, Callbacks extends Partial<AllCallbacks> = DefaultCallbacks>(services: Services, options: CreateAPIBasicQueryClientOptions, callbacks?: Callbacks): APIBasicQueryClientServices<Services, DefaultCallbacks>;
export function createAPIOperationClient<Services extends UnionServiceOperationsDeclaration<Services>, Callbacks extends Partial<AllCallbacks> = DefaultCallbacks>(services: Services, options: CreateAPIBasicClientOptions, callbacks?: Callbacks): APIBasicClientServices<Services, DefaultCallbacks>;
export function createAPIOperationClient<Services extends UnionServiceOperationsDeclaration<Services>, Callbacks extends Partial<AllCallbacks> = DefaultCallbacks>(services: Services, callbacks?: Callbacks): APIUtilityClientServices<Services, Callbacks>;
export function createAPIOperationClient<Services extends UnionServiceOperationsDeclaration<Services>, Callbacks extends Partial<AllCallbacks> = DefaultCallbacks>(services: Services, callbacksOrOptions?: CreateAPIClientOptions | Callbacks, callbacks: Callbacks = defaultCallbacks as Callbacks): APIDefaultQueryClientServices<Services> | APIQueryClientServices<Services, Callbacks> | APIBasicQueryClientServices<Services, Callbacks> | APIBasicClientServices<Services, Callbacks> | APIUtilityClientServices<Services, Callbacks> {
    if (!callbacksOrOptions)
        return qraftAPIClient(services, callbacks);
    if ("requestFn" in callbacksOrOptions)
        return qraftAPIClient(services, callbacks, callbacksOrOptions);
    if ("queryClient" in callbacksOrOptions)
        return qraftAPIClient(services, callbacks, callbacksOrOptions);
    return qraftAPIClient(services, callbacksOrOptions ?? callbacks);
}
type DefaultCallbacks = typeof defaultCallbacks;
type AllCallbacks = typeof allCallbacks;
