import type { Ora } from 'ora';
import process from 'node:process';
import { URL } from 'node:url';

/**
 * Validates Schema's `input` and return `Readable` stream or `URL`
 * @throws {Error} if input is invalid
 */
export function handleSchemaInput(
  input: unknown,
  cwd: URL,
  spinner: Ora,
  schemaName: string
) {
  if (!input) {
    /**
     * Handle `stdin`, if no input file is provided
     * @example
     * ```bash
     * cat schema.json | script.js
     * ```
     */
    if (process.stdin.isTTY) {
      spinner.fail(
        `Input file not found or stdin is empty. Please specify \`input\` argument or pipe ${schemaName} to stdin.`
      );

      throw new Error('Invalid input.');
    }

    return process.stdin;
  }

  /**
   * Handle single file
   * @example
   * ```bash
   * script.js schema.json
   * ```
   */

  if (typeof input !== 'string') {
    spinner.fail('Invalid input. Please specify a single file or URL.');

    throw new Error('Invalid input.');
  }

  // throw error on glob
  if (input.includes('*')) {
    spinner.fail(
      'Globbing is not supported. Please specify a single file or URL.'
    );

    throw new Error('Globbing is not supported.');
  }

  return new URL(input, cwd);
}
