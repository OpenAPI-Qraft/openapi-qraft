import { describe, expect, it } from 'vitest';
import { splitCommaSeparatedGlobs } from './splitCommaSeparatedGlobs.js';

describe('splitCommaSeparatedGlobs', () => {
  it('should split a comma-separated list of globs', () => {
    expect(splitCommaSeparatedGlobs('   /foo ,    /bar/**, ,')).toEqual([
      '/foo',
      '/bar/**',
    ]);
  });

  it('should remove empty globs', () => {
    expect(splitCommaSeparatedGlobs('   ,,,,, ')).toEqual([]);
  });

  it('return an empty array if input is undefined', () => {
    expect(splitCommaSeparatedGlobs(undefined)).toEqual([]);
  });

  it('accepts multiple inputs', () => {
    expect(
      splitCommaSeparatedGlobs(['foo,bar', 'baz,foobar', undefined])
    ).toEqual(['foo', 'bar', 'baz', 'foobar']);
  });

  it('removes redundant inputs', () => {
    expect(splitCommaSeparatedGlobs(['foo,bar', 'bar,baz'])).toEqual([
      'foo',
      'bar',
      'baz',
    ]);
  });

  it('should throw an error on invalid input', () => {
    // @ts-expect-error - invalid input
    expect(() => splitCommaSeparatedGlobs(null)).toThrowError();
    // @ts-expect-error - invalid input
    expect(() => splitCommaSeparatedGlobs(false)).toThrowError();
    // @ts-expect-error - invalid input
    expect(() => splitCommaSeparatedGlobs(0)).toThrowError();
    // @ts-expect-error - invalid input
    expect(() => splitCommaSeparatedGlobs({})).toThrowError();
    // @ts-expect-error - invalid input
    expect(() => splitCommaSeparatedGlobs(Symbol())).toThrowError();
    // @ts-expect-error - invalid input
    expect(() => splitCommaSeparatedGlobs(() => {})).toThrowError();
  });
});
