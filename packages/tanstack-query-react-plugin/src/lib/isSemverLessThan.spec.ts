import { describe, expect, it } from 'vitest';
import { isSemverLessThan } from './isSemverLessThan.js';

describe('isSemverLessThan', () => {
  describe('basic version comparison', () => {
    it('should return true when first version is less than second', () => {
      expect(isSemverLessThan('5.79.0', '5.80.0')).toBe(true);
      expect(isSemverLessThan('4.29.1', '5.0.0')).toBe(true);
      expect(isSemverLessThan('1.0.0', '2.0.0')).toBe(true);
    });

    it('should return false when versions are equal', () => {
      expect(isSemverLessThan('5.80.0', '5.80.0')).toBe(false);
      expect(isSemverLessThan('1.0.0', '1.0.0')).toBe(false);
      expect(isSemverLessThan('10.15.3', '10.15.3')).toBe(false);
    });

    it('should return false when first version is greater than second', () => {
      expect(isSemverLessThan('5.81.0', '5.80.0')).toBe(false);
      expect(isSemverLessThan('6.0.0', '5.99.99')).toBe(false);
      expect(isSemverLessThan('2.0.0', '1.99.99')).toBe(false);
    });
  });

  describe('major version comparison', () => {
    it('should correctly compare different major versions', () => {
      expect(isSemverLessThan('4.99.99', '5.0.0')).toBe(true);
      expect(isSemverLessThan('5.0.0', '4.99.99')).toBe(false);
      expect(isSemverLessThan('1.0.0', '10.0.0')).toBe(true);
      expect(isSemverLessThan('10.0.0', '2.0.0')).toBe(false);
    });
  });

  describe('minor version comparison', () => {
    it('should correctly compare different minor versions with same major', () => {
      expect(isSemverLessThan('5.79.99', '5.80.0')).toBe(true);
      expect(isSemverLessThan('5.80.0', '5.79.99')).toBe(false);
      expect(isSemverLessThan('3.14.15', '3.15.0')).toBe(true);
    });
  });

  describe('patch version comparison', () => {
    it('should correctly compare different patch versions', () => {
      expect(isSemverLessThan('5.80.0', '5.80.1')).toBe(true);
      expect(isSemverLessThan('5.80.1', '5.80.0')).toBe(false);
      expect(isSemverLessThan('1.2.3', '1.2.4')).toBe(true);
    });
  });

  describe('versions with different lengths', () => {
    it('should treat missing parts as 0', () => {
      expect(isSemverLessThan('5.80', '5.80.0')).toBe(false);
      expect(isSemverLessThan('5.80.0', '5.80')).toBe(false);
      expect(isSemverLessThan('5.79', '5.80.0')).toBe(true);
      expect(isSemverLessThan('5.81', '5.80.0')).toBe(false);
    });

    it('should handle single version numbers', () => {
      expect(isSemverLessThan('5', '6.0.0')).toBe(true);
      expect(isSemverLessThan('6', '5.99.99')).toBe(false);
      expect(isSemverLessThan('5', '5.0.0')).toBe(false);
    });

    it('should handle versions with many parts', () => {
      expect(isSemverLessThan('1.2.3.4.5', '1.2.3.4.6')).toBe(true);
      expect(isSemverLessThan('1.2.3.4.6', '1.2.3.4.5')).toBe(false);
      expect(isSemverLessThan('1.2.3.4', '1.2.3.4.1')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle zero versions', () => {
      expect(isSemverLessThan('0.0.0', '0.0.1')).toBe(true);
      expect(isSemverLessThan('0.0.1', '0.0.0')).toBe(false);
      expect(isSemverLessThan('0.0.0', '1.0.0')).toBe(true);
    });

    it('should handle large version numbers', () => {
      expect(isSemverLessThan('999.999.999', '1000.0.0')).toBe(true);
      expect(isSemverLessThan('1000.0.0', '999.999.999')).toBe(false);
    });
  });

  describe('real-world TanStack Query versions', () => {
    it('should correctly identify versions prior to 5.80.0', () => {
      const priorVersions = [
        '5.79.0',
        '5.79.1',
        '5.50.1',
        '5.0.0',
        '4.29.0',
        '4.36.1',
        '3.39.3',
      ];

      priorVersions.forEach((version) => {
        expect(isSemverLessThan(version, '5.80.0')).toBe(true);
      });
    });

    it('should correctly identify versions equal to or after 5.80.0', () => {
      const laterVersions = [
        '5.80.0',
        '5.80.1',
        '5.81.0',
        '5.90.0',
        '6.0.0',
        '6.1.0',
      ];

      laterVersions.forEach((version) => {
        expect(isSemverLessThan(version, '5.80.0')).toBe(false);
      });
    });
  });
});
