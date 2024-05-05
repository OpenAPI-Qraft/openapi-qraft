import { describe, it, expect } from 'vitest';

import { QraftCommand, splitOptionFlags } from './QraftCommand.js';

describe('QraftCommand', () => {
  it('merges options with similar flags and input', () => {
    const command = new QraftCommand();

    command.option('-m,--mixed <value>', 'A mixed option');
    command.option('-m,--mixed <value>', 'A mixed option');
    expect(
      command.options.filter((option) => option.flags === '-m,--mixed <value>')
    ).toHaveLength(1);
  });

  it('throws if similar option flags have different long names', () => {
    const command = new QraftCommand();

    command.option('-m,--dummy <value>', 'A mixed option');
    expect(() =>
      command.option('-m,--mixed <value>', 'A mixed option')
    ).toThrow(
      'Long flag -m,--mixed <value> already exists in the option list with flags: "-m,--dummy <value>" and description: "A mixed option"'
    );
  });

  it('throws if similar option flags have different short names', () => {
    const command = new QraftCommand();

    command.option('-d,--mixed <value>', 'A mixed option');
    expect(() =>
      command.option('-m,--mixed <value>', 'A mixed option')
    ).toThrow(
      'Short flag -m,--mixed <value> already exists in the option list with flags: "-d,--mixed <value>" and description: "A mixed option"'
    );
  });

  it('throws if similar option flags have partial inputs', () => {
    const command = new QraftCommand();

    command.option('-m,--mixed', 'A mixed option');

    expect(() =>
      command.option('-m,--mixed <value>', 'A mixed option')
    ).toThrow(
      'Flag -m,--mixed <value> already exists in the option list with flags: "-m,--mixed" and description: "A mixed option" but with different required status'
    );
  });

  it('throws if similar option flags have different inputs', () => {
    const command = new QraftCommand();

    command.option('-m,--mixed <value>', 'A mixed option');
    expect(() =>
      command.option('-m,--mixed [value]', 'A mixed option')
    ).toThrow(
      'Flag -m,--mixed [value] already exists in the option list with flags: "-m,--mixed <value>" and description: "A mixed option" but with different required status'
    );
  });

  it('throws if similar option flags have different mandatory', () => {
    const command = new QraftCommand();

    command.requiredOption('-m,--mixed <value>', 'A mixed option');
    expect(() =>
      command.option('-m,--mixed <value>', 'A mixed option')
    ).toThrow(
      'Flag -m,--mixed <value> already exists in the option list with flags: "-m,--mixed <value>" and description: "A mixed option" but with different mandatory status'
    );
  });

  it('throws if similar option flags have different variadic', () => {
    const command = new QraftCommand();

    command.option('-m,--mixed <value>', 'A mixed option');
    expect(() =>
      command.option('-m,--mixed <value...>', 'A mixed option')
    ).toThrow(
      'Flag -m,--mixed <value...> already exists in the option list with flags: "-m,--mixed <value>" and description: "A mixed option" but with different variadic status'
    );
  });

  describe('splitOptionFlags(...)', () => {
    it('should split short and long flags with input', () => {
      expect(splitOptionFlags('-m,--mixed <value>')).toEqual({
        shortFlag: '-m',
        longFlag: '--mixed',
      });
    });

    it('should split short and long flags without input', () => {
      expect(splitOptionFlags('-m,--mixed')).toEqual({
        shortFlag: '-m',
        longFlag: '--mixed',
      });
    });

    it('should remove extra flags', () => {
      expect(splitOptionFlags('-m,--mixed,-a,--all')).toEqual({
        shortFlag: '-m',
        longFlag: '--mixed',
      });
    });
  });
});
