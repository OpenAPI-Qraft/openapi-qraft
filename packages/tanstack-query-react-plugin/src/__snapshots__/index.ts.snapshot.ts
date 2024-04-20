import fs from 'node:fs';
import { expect } from 'vitest';

export default function () {
  expect(fs.readFileSync('/mock-fs/index.ts', 'utf-8')).toMatchInlineSnapshot(`
    "/* generated using @openapi-qraft/cli -- do no edit */
    /* istanbul ignore file */
    export { services } from "./services/index.js";
    export type { Services } from "./services/index.js";
    export { createAPIClient } from "./create-api-client.js";
    "
  `);
}
