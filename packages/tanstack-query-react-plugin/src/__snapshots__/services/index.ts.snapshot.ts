import fs from 'node:fs';
import { expect } from 'vitest';

export default function () {
  expect(fs.readFileSync('/mock-fs/services/index.ts', 'utf-8'))
    .toMatchInlineSnapshot(`
      "/* generated using @openapi-qraft/cli -- do no edit */
      /* istanbul ignore file */
      import { EntitiesService, entitiesService } from "./EntitiesService.js";
      import { ApprovalPoliciesService, approvalPoliciesService } from "./ApprovalPoliciesService.js";
      import { FilesService, filesService } from "./FilesService.js";
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
      "
    `);
}