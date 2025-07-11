/**
 * This file was auto-generated by @openapi-qraft/cli.
 * Do not make direct changes to the file.
 */

import type { APIBasicQueryClientServices, APIDefaultQueryClientServices, APIQueryClientServices, APIUtilityClientServices, CreateAPIBasicClientOptions, CreateAPIBasicQueryClientOptions, CreateAPIClientOptions, CreateAPIQueryClientOptions } from "@openapi-qraft/react";
import type { APIBasicClientServices } from "../type-overrides/create-query-client-options.js";
import type * as allCallbacks from "@openapi-qraft/react/callbacks/index";
import { qraftAPIClient } from "@openapi-qraft/react";
const defaultCallbacks = {} as const;
import { services } from "./services/index";
export function createAPIOperationClient(options: CreateAPIQueryClientOptions, callbacks: AllCallbacks): APIDefaultQueryClientServices<Services>;
export function createAPIOperationClient<Callbacks extends Partial<AllCallbacks> = DefaultCallbacks>(options: CreateAPIQueryClientOptions, callbacks: Callbacks): APIQueryClientServices<Services, Callbacks>;
export function createAPIOperationClient<Callbacks extends Partial<AllCallbacks> = DefaultCallbacks>(options: CreateAPIBasicQueryClientOptions, callbacks: Callbacks): APIBasicQueryClientServices<Services, DefaultCallbacks>;
export function createAPIOperationClient<Callbacks extends Partial<AllCallbacks> = DefaultCallbacks>(options: CreateAPIBasicClientOptions, callbacks: Callbacks): APIBasicClientServices<Services, DefaultCallbacks>;
export function createAPIOperationClient<Callbacks extends Partial<AllCallbacks> = DefaultCallbacks>(callbacks: Callbacks): APIUtilityClientServices<Services, Callbacks>;
export function createAPIOperationClient<Callbacks extends Partial<AllCallbacks> = DefaultCallbacks>(callbacksOrOptions: CreateAPIClientOptions | Callbacks, callbacks: Callbacks = defaultCallbacks as Callbacks): APIDefaultQueryClientServices<Services> | APIQueryClientServices<Services, Callbacks> | APIBasicQueryClientServices<Services, Callbacks> | APIBasicClientServices<Services, Callbacks> | APIUtilityClientServices<Services, Callbacks> {
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
type Services = typeof services;
