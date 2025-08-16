import { describe, expect, test } from 'vitest';
import { createClientNameRegex } from '../utils/create-client-name-regex';

describe('createClientNameRegex', () => {
  describe('default behavior', () => {
    test('should return default "/qraft|api/i" pattern when no pattern provided', () => {
      const regex = createClientNameRegex(undefined);
      expect(regex.source).toBe('qraft|api');
      expect(regex.flags).toBe('i');
    });

    test('should throw error when empty string provided', () => {
      expect(() => createClientNameRegex('')).toThrow(
        'clientNamePattern cannot be empty or contain only whitespace'
      );
    });

    test('should throw error when whitespace-only string provided', () => {
      expect(() => createClientNameRegex('   ')).toThrow(
        'clientNamePattern cannot be empty or contain only whitespace'
      );
    });

    test('should throw error when tabs and spaces only provided', () => {
      expect(() => createClientNameRegex('\t  \n  ')).toThrow(
        'clientNamePattern cannot be empty or contain only whitespace'
      );
    });
  });

  describe('plain string patterns', () => {
    test('should create regex from plain string', () => {
      const regex = createClientNameRegex('api');
      expect(regex.source).toBe('api');
      expect(regex.flags).toBe('');
    });

    test('should handle special regex characters in plain string', () => {
      const regex = createClientNameRegex('api.client');
      expect(regex.source).toBe('api.client');
      expect(regex.flags).toBe('');
    });

    test('should handle complex plain string patterns', () => {
      const regex = createClientNameRegex('^myClient$');
      expect(regex.source).toBe('^myClient$');
      expect(regex.flags).toBe('');
    });
  });

  describe('regex format patterns', () => {
    test('should parse regex with case insensitive flag', () => {
      const regex = createClientNameRegex('/api/i');
      expect(regex.source).toBe('api');
      expect(regex.flags).toBe('i');
    });

    test('should parse regex with global flag', () => {
      const regex = createClientNameRegex('/qraft/g');
      expect(regex.source).toBe('qraft');
      expect(regex.flags).toBe('g');
    });

    test('should parse regex with multiple flags', () => {
      const regex = createClientNameRegex('/client/gim');
      expect(regex.source).toBe('client');
      expect(regex.flags).toBe('gim');
    });

    test('should parse regex with all supported flags', () => {
      const regex = createClientNameRegex('/test/gimuy');
      expect(regex.source).toBe('test');
      expect(regex.flags).toBe('gimuy');
    });

    test('should parse complex regex patterns', () => {
      const regex = createClientNameRegex('/^api.*client$/i');
      expect(regex.source).toBe('^api.*client$');
      expect(regex.flags).toBe('i');
    });

    test('should parse regex with escaped forward slashes', () => {
      const regex = createClientNameRegex('/api\\/v1/i');
      expect(regex.source).toBe('api\\/v1');
      expect(regex.flags).toBe('i');
    });
  });

  describe('edge cases', () => {
    test('should treat malformed regex as plain string', () => {
      const regex = createClientNameRegex('/api');
      expect(regex.source).toBe('\\/api'); // Forward slashes are escaped in RegExp.source
      expect(regex.flags).toBe('');
    });

    test('should treat regex without closing slash as plain string', () => {
      const regex = createClientNameRegex('/api/i/extra');
      expect(regex.source).toBe('\\/api\\/i\\/extra'); // Forward slashes are escaped in RegExp.source
      expect(regex.flags).toBe('');
    });

    test('should throw error for empty regex pattern', () => {
      expect(() => createClientNameRegex('//i')).toThrow(
        'clientNamePattern cannot be empty or contain only whitespace'
      );
    });

    test('should throw error for whitespace-only regex pattern', () => {
      expect(() => createClientNameRegex('/   /g')).toThrow(
        'clientNamePattern cannot be empty or contain only whitespace'
      );
    });

    test('should handle regex with no flags', () => {
      const regex = createClientNameRegex('/api/');
      expect(regex.source).toBe('api');
      expect(regex.flags).toBe('');
    });

    test('should reject invalid flags', () => {
      const regex = createClientNameRegex('/api/x');
      expect(regex.source).toBe('\\/api\\/x'); // Forward slashes are escaped in RegExp.source
      expect(regex.flags).toBe('');
    });
  });

  describe('functionality tests', () => {
    test('should match correctly with case insensitive flag', () => {
      const regex = createClientNameRegex('/api/i');
      expect(regex.test('API')).toBe(true);
      expect(regex.test('api')).toBe(true);
      expect(regex.test('Api')).toBe(true);
    });

    test('should match correctly with anchors', () => {
      const regex = createClientNameRegex('/^qraft$/');
      expect(regex.test('qraft')).toBe(true);
      expect(regex.test('myqraft')).toBe(false);
      expect(regex.test('qraftclient')).toBe(false);
    });

    test('should match correctly with plain string pattern', () => {
      const regex = createClientNameRegex('client');
      expect(regex.test('client')).toBe(true);
      expect(regex.test('myclient')).toBe(true);
      expect(regex.test('clientapi')).toBe(true);
      expect(regex.test('api')).toBe(false);
    });
  });
});
