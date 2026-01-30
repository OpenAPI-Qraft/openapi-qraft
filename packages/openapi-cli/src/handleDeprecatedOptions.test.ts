import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleDeprecatedOptions } from './handleDeprecatedOptions.js';

describe('handleDeprecatedOptions', () => {
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  beforeEach(() => {
    warnSpy.mockClear();
  });

  afterEach(() => {
    warnSpy.mockClear();
  });

  it('should replace -rm with -c', () => {
    const result = handleDeprecatedOptions(['-rm']);
    expect(result).toEqual(['-c']);
  });

  it('should show deprecation warning for -rm', () => {
    handleDeprecatedOptions(['-rm']);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('-rm');
    expect(warnSpy.mock.calls[0][0]).toContain('-c');
    expect(warnSpy.mock.calls[0][0]).toContain('v3.0');
  });

  it('should not modify other arguments', () => {
    const result = handleDeprecatedOptions(['--output-dir', 'src/api', '-o']);
    expect(result).toEqual(['--output-dir', 'src/api', '-o']);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should handle mixed arguments with deprecated option', () => {
    const result = handleDeprecatedOptions([
      '--plugin',
      'tanstack-query-react',
      '-rm',
      '-o',
      'src/api',
    ]);
    expect(result).toEqual([
      '--plugin',
      'tanstack-query-react',
      '-c',
      '-o',
      'src/api',
    ]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
