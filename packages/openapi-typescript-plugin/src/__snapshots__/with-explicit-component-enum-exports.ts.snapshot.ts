/**
 * This file was auto-generated by @openapi-qraft/cli.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/files": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a files by ID */
        get: operations["get_files"];
        put?: never;
        /** Upload a files by ID */
        post: operations["post_files"];
        /** Delete all files */
        delete: operations["delete_files"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        EntityOnboardingDocuments: {
            verification_document_front: string;
            verification_document_back?: string;
        };
        ErrorSchema: {
            message: string;
        };
        ErrorSchemaResponse: {
            error: components["schemas"]["ErrorSchema"];
        };
        HTTPValidationError: {
            detail?: components["schemas"]["ValidationError"][];
        };
        ValidationError: {
            loc: (string | number)[];
            msg: string;
            type: string;
        };
        ApprovalPolicyUpdate: {
            /** @description The name of the approval policy. */
            name?: string;
            /** @description A brief description of the approval policy. */
            description?: string;
            /** @description A list of JSON objects that represents the approval policy script. The script contains the logic that determines whether an action should be sent to approval. This field is required, and it should contain at least one script object. */
            script?: (boolean | number | string | unknown[] | Record<string, never>)[];
            /**
             * @description A JSON object that represents the trigger for the approval policy. The trigger specifies the event that will trigger the policy to be evaluated.
             * @example {amount >= 1000}
             */
            trigger?: boolean | number | string | unknown[] | Record<string, never>;
            /** @description A string that represents the current status of the approval policy. */
            status?: components["schemas"]["ApprovalPolicyStatus"];
        };
        /**
         * @description An enumeration.
         * @enum {string}
         */
        ApprovalPolicyStatus: ApprovalPolicyStatus;
        ApprovalPolicyResource: {
            /** @description The name of the approval policy. */
            name: string;
            /** @description A brief description of the approval policy. */
            description: string;
            /** Format: uuid */
            id: string;
        };
        /**
         * @description An enumeration.
         * @enum {string}
         */
        OrderEnum: OrderEnum;
        FilesResponse: {
            data: components["schemas"]["FileResponse"][];
        };
        FileResponse: {
            /** Format: uuid */
            id: string;
            file_type: string;
            name: string;
            url: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    get_files: {
        parameters: {
            query: {
                id__in: string[];
                /** @description Page number */
                page?: string;
            };
            header: {
                /** @example 2023-06-04 */
                "x-monite-version": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        header?: {
                            /** Format: date */
                            "x-monite-version"?: string;
                        };
                        query?: {
                            id__in?: string[];
                            /** @description Page number */
                            page?: string;
                        };
                    };
                };
            };
            /** @description Method Not Allowed */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorSchemaResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal Server Error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorSchemaResponse"];
                };
            };
        };
    };
    post_files: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file?: Blob;
                    file_description?: string;
                };
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        body?: {
                            file?: string;
                            file_description?: string;
                        };
                    };
                };
            };
            /** @description Internal Server Error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorSchemaResponse"];
                };
            };
        };
    };
    delete_files: {
        parameters: {
            query?: {
                all?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        query?: {
                            all?: boolean;
                        };
                    };
                };
            };
            /** @description Internal Server Error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorSchemaResponse"];
                };
            };
        };
    };
}
export enum ApprovalPolicyStatus {
    active = "active",
    deleted = "deleted",
    pending = "pending"
}
export enum OrderEnum {
    asc = "asc",
    desc = "desc"
}
export type EntityOnboardingDocuments = components["schemas"]["EntityOnboardingDocuments"];
export type ErrorSchema = components["schemas"]["ErrorSchema"];
export type ErrorSchemaResponse = components["schemas"]["ErrorSchemaResponse"];
export type HTTPValidationError = components["schemas"]["HTTPValidationError"];
export type ValidationError = components["schemas"]["ValidationError"];
export type ApprovalPolicyUpdate = components["schemas"]["ApprovalPolicyUpdate"];
export type ApprovalPolicyResource = components["schemas"]["ApprovalPolicyResource"];
export type FilesResponse = components["schemas"]["FilesResponse"];
export type FileResponse = components["schemas"]["FileResponse"];
