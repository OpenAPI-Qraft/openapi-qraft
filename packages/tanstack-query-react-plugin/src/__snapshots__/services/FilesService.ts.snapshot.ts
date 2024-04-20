import fs from 'node:fs';
import { expect } from 'vitest';

export default function () {
  expect(fs.readFileSync('/mock-fs/services/FilesService.ts', 'utf-8'))
    .toMatchInlineSnapshot(`
      "/* generated using @openapi-qraft/cli -- do no edit */
      /* istanbul ignore file */
      import type { paths } from "../../openapi.js";
      import type { ServiceOperationQuery, ServiceOperationMutation } from "@openapi-qraft/react";
      export interface FilesService {
          /** @summary Get a files by ID */
          getFiles: ServiceOperationQuery<{
              method: "get";
              url: "/files";
          }, paths["/files"]["get"]["responses"]["200"]["content"]["application/json"], paths["/files"]["get"]["parameters"], paths["/files"]["get"]["responses"]["405"]["content"]["application/json"] | paths["/files"]["get"]["responses"]["422"]["content"]["application/json"] | paths["/files"]["get"]["responses"]["default"]["content"]["application/json"]>;
          /** @summary Upload a files by ID */
          postFiles: ServiceOperationMutation<{
              method: "post";
              url: "/files";
              mediaType: "multipart/form-data";
          }, NonNullable<paths["/files"]["post"]["requestBody"]>["content"]["multipart/form-data"], paths["/files"]["post"]["responses"]["200"]["content"]["application/json"], undefined, paths["/files"]["post"]["responses"]["default"]["content"]["application/json"]>;
      }
      export const filesService: {
          [key in keyof FilesService]: Pick<FilesService[key], "schema">;
      } = {
          getFiles: {
              schema: {
                  method: "get",
                  url: "/files"
              }
          },
          postFiles: {
              schema: {
                  method: "post",
                  url: "/files",
                  mediaType: "multipart/form-data"
              }
          }
      } as const;
      "
    `);
}
