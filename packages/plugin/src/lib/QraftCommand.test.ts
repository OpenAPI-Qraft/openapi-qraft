import { Option } from 'commander';
import { describe, expect, it, vi } from 'vitest';
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

  describe('normalizeBooleanFalseArgs', () => {
    const createCommand = () =>
      new QraftCommand()
        .option(
          '--service-object-exports [bool]',
          'Export service objects',
          (arg) => arg?.toLowerCase() !== 'false',
          true
        )
        .addOption(
          new Option(
            '--explicit-import-extensions [extension]',
            'Explicit import extensions'
          )
            .preset('.js')
            .choices(['.js', '.ts'])
        )
        .option('--no-blob-from-binary', 'Disable Blob conversion');

    it('keeps optional [bool] =false while stripping plain boolean toggles and choice options via parse({ from: "user" })', () => {
      const command = createCommand();

      command.parse(
        [
          '--service-object-exports=false',
          '--clean=false',
          '--explicit-import-extensions=false',
          '--no-blob-from-binary=false',
        ],
        { from: 'user' }
      );

      expect(command.opts()).toEqual({
        fileHeader: '',
        serviceObjectExports: false,
        blobFromBinary: true,
      });
    });

    it('normalizes =false args via parseAsync with default node argv layout', async () => {
      const command = createCommand();
      const spinnerSpy = vi
        .spyOn(QraftCommand.spinner, 'info')
        .mockImplementation(() => QraftCommand.spinner);

      try {
        await command.parseAsync([
          'node',
          'qraft',
          '--service-object-exports=false',
          '--clean=false',
          '--explicit-import-extensions=false',
        ]);
      } finally {
        spinnerSpy.mockRestore();
      }

      expect(command.opts()).toEqual({
        fileHeader: '',
        serviceObjectExports: false,
        blobFromBinary: true,
      });
    });

    it('preserves =false values passed to required options or after -- terminator', () => {
      const command = createCommand().allowExcessArguments();

      command.parse(['--file-header', '--clean=false', '--', '--clean=false'], {
        from: 'user',
      });

      expect(command.opts()).toEqual({
        fileHeader: '--clean=false',
        serviceObjectExports: true,
        blobFromBinary: true,
      });
      expect(command.args).toEqual(['--clean=false']);

      const equalsCommand = createCommand();
      equalsCommand.parse(['--file-header=false'], { from: 'user' });
      expect(equalsCommand.opts()).toEqual({
        fileHeader: 'false',
        serviceObjectExports: true,
        blobFromBinary: true,
      });
    });

    it('does not strip unknown --flag=false options', () => {
      const command = createCommand().exitOverride();
      command.configureOutput({
        writeErr: () => {},
      });

      expect(() =>
        command.parse(['--unknown-flag=false'], { from: 'user' })
      ).toThrow(/unknown option '--unknown-flag=false'/i);
    });
  });
});
