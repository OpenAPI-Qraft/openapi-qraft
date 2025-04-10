/**
 * This file was auto-generated by @openapi-qraft/cli.
 * Do not make direct changes to the file.
 */

import type { EntitiesService } from "./EntitiesService.js";
import { entitiesService } from "./EntitiesService.js";
import type { ApprovalPoliciesService } from "./ApprovalPoliciesService.js";
import { approvalPoliciesService } from "./ApprovalPoliciesService.js";
import type { FilesService } from "./FilesService.js";
import { filesService } from "./FilesService.js";
export type Services = {
    entities: EntitiesService;
    approvalPolicies: ApprovalPoliciesService;
    files: FilesService;
};
export const services = {
    entities: entitiesService,
    approvalPolicies: approvalPoliciesService,
    files: filesService
} as const;
