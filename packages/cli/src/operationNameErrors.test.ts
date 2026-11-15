import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const binPath = fileURLToPath(new URL('../bin.mjs', import.meta.url));

describe.each(['direct', 'redocly'])('%s operation naming errors', (mode) => {
  let directory: string;

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'qraft-naming-errors-'));
  });

  afterEach(() => {
    fs.rmSync(directory, { recursive: true, force: true });
  });

  it.each([
    {
      operationIds: ['getItems', 'get_items'],
      message: 'Operation name collision in service "items"',
      endpoints: ['GET /items', 'POST /items'],
    },
    {
      operationIds: ['123'],
      message: 'Empty normalized operation name in service "items"',
      endpoints: ['GET /items'],
    },
  ])(
    'prints $message once without a stack trace',
    ({ operationIds, message, endpoints }) => {
      const schemaPath = path.join(directory, 'schema.json');
      const outputDir = path.join(directory, 'out');
      const servicesDir = path.join(outputDir, 'services');
      const existingService = path.join(servicesDir, 'existing.ts');
      fs.mkdirSync(servicesDir, { recursive: true });
      fs.writeFileSync(existingService, 'export const existing = true;');
      fs.writeFileSync(
        schemaPath,
        JSON.stringify({
          openapi: '3.1.0',
          info: { title: 'Naming errors', version: '1.0.0' },
          paths: {
            '/items': Object.fromEntries(
              operationIds.map((operationId, index) => [
                index === 0 ? 'get' : 'post',
                { operationId, responses: { 200: { description: 'OK' } } },
              ])
            ),
          },
        })
      );

      const configPath = path.join(directory, 'redocly.yaml');
      fs.writeFileSync(
        configPath,
        `
x-openapi-qraft:
  plugin:
    tanstack-query-react: true
    openapi-typescript: true
apis:
  main:
    root: ./schema.json
    x-openapi-qraft:
      output-dir: ./out
      clean: true
`
      );

      const args =
        mode === 'redocly'
          ? ['main', '--redocly', configPath]
          : [
              schemaPath,
              '--plugin',
              'tanstack-query-react',
              '--plugin',
              'openapi-typescript',
              '-o',
              outputDir,
              '--clean',
            ];
      const result = spawnSync(process.execPath, [binPath, ...args], {
        cwd: directory,
        encoding: 'utf8',
        timeout: 15_000,
        env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
      });
      const output = result.stdout + result.stderr;

      expect(result.error).toBeUndefined();
      expect(result.status).toBe(1);
      expect(output.split(message), output).toHaveLength(2);
      for (const endpoint of endpoints) expect(output).toContain(endpoint);
      expect(output).not.toContain('CommanderError:');
      expect(output).not.toContain('The following errors occurred');
      expect(output).not.toContain('Node.js v');
      expect(output).not.toMatch(/\n\s+at /);
      expect(fs.readFileSync(existingService, 'utf8')).toBe(
        'export const existing = true;'
      );
      expect(fs.readdirSync(servicesDir)).toEqual(['existing.ts']);
    },
    20_000
  );
});
