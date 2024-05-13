import { describe, expect, it } from 'vitest';

import { extractArgvPluginOptions } from './bin.js';

describe('bin', () => {
  describe('extractArgvPluginOptions(...)', () => {
    it('returns single plugin', () => {
      expect(
        extractArgvPluginOptions(['--plugin', 'tanstack-query-react'])
      ).toEqual({
        argv: [],
        plugins: ['tanstack-query-react'],
      });
    });

    it('filters out plugin options', () => {
      expect(
        extractArgvPluginOptions([
          '--fake-boolean',
          '--plugin',
          'tanstack-query-react',
          '--input',
          'openapi.json',
        ])
      ).toEqual({
        argv: ['--fake-boolean', '--input', 'openapi.json'],
        plugins: ['tanstack-query-react'],
      });
    });

    it('extracts multiple plugins if specified', () => {
      expect(
        extractArgvPluginOptions([
          '--plugin',
          'tanstack-query-react',
          '--plugin',
          'tanstack-query-react-2',
        ])
      ).toEqual({
        argv: [],
        plugins: ['tanstack-query-react', 'tanstack-query-react-2'],
      });
    });
  });
});
