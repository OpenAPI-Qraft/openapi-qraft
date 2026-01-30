import { sep } from 'node:path';
import process from 'node:process';
import { pathToFileURL, URL } from 'node:url';
import c from 'ansi-colors';
import { Command, Option, ParseOptions } from 'commander';
import ora, { Ora } from 'ora';
import { GeneratorFile } from './GeneratorFile.js';
import { OutputOptions } from './OutputOptions.js';
import { writeGeneratorFiles } from './writeGeneratorFiles.js';

export class QraftCommand<
  TActionOptions extends QraftCommandActionOptions = QraftCommandActionOptions,
> extends Command {
  static spinner = ora();

  protected readonly cwd: URL;
  protected registeredPluginActions: QraftCommandActionCallback<TActionOptions>[] =
    [];

  constructor(name?: string) {
    super(name);
    this.cwd = pathToFileURL(`${process.cwd()}/`);

    this.option(
      '-o, --output-dir <path>',
      'Output directory for generated files'
    )
      .addOption(
        new Option(
          '-c, --clean',
          'Clean output directory before generating files'
        )
      )
      .addOption(
        new Option(
          '--file-header <string>',
          'Header to be added to the generated file (eg: /* eslint-disable */)'
        )
      );
  }

  action(callback: QraftCommandActionCallback<TActionOptions>): this {
    this.registerPluginAction(callback);
    return super.action(this.actionCallback.bind(this));
  }

  async actionCallback(...actionArgs: any[]): Promise<void> {
    const inputs = actionArgs.filter(
      (arg) => typeof arg === 'string'
    ) as string[];
    const args = actionArgs.find(
      (arg) => arg && typeof arg === 'object'
    ) as Record<string, any>;

    if (!args) throw new Error('Arguments object not found');

    const spinner = QraftCommand.spinner;

    spinner.start('Initializing process...');

    const actionOptions = await this.prepareActionOptions(inputs, args);

    spinner.text = 'Generating code...';

    for (const pluginAction of this.registeredPluginActions) {
      const fileItems = await new Promise<GeneratorFile[]>(
        (resolve, reject) => {
          pluginAction(actionOptions, resolve).catch(reject);
        }
      );

      try {
        if (this.registeredPluginActions.indexOf(pluginAction) === 0) {
          await writeGeneratorFiles({
            fileItems: [
              { directory: actionOptions.output.dir, clean: false },
              ...fileItems,
            ],
            spinner,
          });
        } else {
          await writeGeneratorFiles({ fileItems, spinner });
        }
      } catch (error) {
        spinner.fail(
          c.red('An error occurred during the code generation process.')
        );

        if (error instanceof Error) {
          console.error(c.red(error.message), c.red(error.stack ?? ''));
        }

        throw error;
      }
    }

    spinner.succeed(c.green('Qraft process completed successfully'));
  }

  protected async prepareActionOptions(
    inputs: string[],
    args: Record<string, any>
  ): Promise<TActionOptions> {
    const outputDir = normalizeOutputDirPath(args.outputDir);

    return {
      inputs,
      args,
      spinner: QraftCommand.spinner,
      output: {
        dir: outputDir,
        clean: args.clean,
      },
    } as TActionOptions;
  }

  protected registerPluginAction(
    callback: QraftCommandActionCallback<TActionOptions>
  ) {
    this.registeredPluginActions.push(callback);
  }

  option(
    flags: string,
    description?: string,
    defaultValue?: string | boolean | string[]
  ): this;
  option<T>(
    flags: string,
    description: string,
    parseArg: (value: string, previous: T) => T,
    defaultValue?: T
  ): this;
  /** @deprecated since v7, instead use choices or a custom function */
  option(
    flags: string,
    description: string,
    regexp: RegExp,
    defaultValue?: string | boolean | string[]
  ): this;
  option<T>(
    flags: string,
    description?: string,
    parseArg?:
      | ((value: string, previous: T) => T)
      | string
      | boolean
      | string[]
      | RegExp,
    defaultValue?: T
  ): this {
    if (
      this.findSimilarOption({
        flags,
        mandatory: false,
      })
    ) {
      return this;
    }

    return super.option(
      flags,
      // @ts-expect-error - Issues with overloading
      description,
      parseArg,
      defaultValue
    );
  }

  requiredOption(
    flags: string,
    description?: string,
    defaultValue?: string | boolean | string[]
  ): this;
  requiredOption<T>(
    flags: string,
    description: string,
    parseArg: (value: string, previous: T) => T,
    defaultValue?: T
  ): this;
  /** @deprecated since v7, instead use choices or a custom function */
  requiredOption(
    flags: string,
    description: string,
    regexp: RegExp,
    defaultValue?: string | boolean | string[]
  ): this;
  requiredOption<T>(
    flags: string,
    description?: string,
    regexpOrDefaultValue?:
      | string
      | boolean
      | string[]
      | RegExp
      | ((value: string, previous: T) => T),
    defaultValue?: string | boolean | string[]
  ): this {
    if (
      this.findSimilarOption({
        flags,
        mandatory: true,
      })
    ) {
      return this;
    }

    return super.requiredOption(
      flags,
      // @ts-expect-error - Issues with overloading
      description,
      regexpOrDefaultValue,
      defaultValue
    );
  }

  addOption(option: Option): this {
    if (
      this.findSimilarOption({
        flags: option.flags,
        mandatory: option.mandatory,
      })
    ) {
      return this;
    }

    return super.addOption(option);
  }

  parseAsync(argv?: readonly string[], options?: ParseOptions): Promise<this> {
    if (options?.from !== 'user') this.logVersion();
    return super.parseAsync(argv, options);
  }

  parse(argv?: readonly string[], options?: ParseOptions): this {
    if (options?.from !== 'user') this.logVersion();
    return super.parse(argv, options);
  }

  protected logVersion() {
    QraftCommand.spinner.info(`✨ ${c.bold('Qraft')}`);
  }

  protected findSimilarOption(option: { flags: string; mandatory: boolean }) {
    try {
      return findSimilarOption(option, this.options);
    } catch (error) {
      console.error(
        c.red(
          error instanceof Error
            ? error.message
            : 'An error occurred during command option setup'
        )
      );

      throw error;
    }
  }
}

export function normalizeOutputDirPath(outputDir: string): URL {
  return pathToFileURL(
    outputDir.endsWith(sep) ? outputDir : `${outputDir}${sep}`
  );
}

export interface QraftCommandActionOptions {
  inputs: string[];
  args: Record<string, any>;
  spinner: Ora;
  output: OutputOptions;
}

export type QraftCommandActionCallback<
  TActionOptions extends QraftCommandActionOptions = QraftCommandActionOptions,
> = (
  options: TActionOptions,
  resolve: (files: GeneratorFile[]) => void
) => Promise<void>;

function findSimilarOption(
  {
    flags,
    mandatory,
  }: {
    flags: string;
    mandatory: boolean;
  },
  options: readonly Option[]
) {
  const newOptionParsedFlags = splitOptionFlags(flags);
  const optional = flags.includes('[');
  const required = flags.includes('<');
  const variadic = /\w\.\.\.[>\]]$/.test(flags);

  return options.find((existingOption) => {
    const existingOptionParsedFlags = splitOptionFlags(existingOption.flags);

    if (
      !(
        (existingOptionParsedFlags.longFlag !== undefined &&
          existingOptionParsedFlags.longFlag ===
            newOptionParsedFlags.longFlag) ||
        (existingOptionParsedFlags.shortFlag !== undefined &&
          existingOptionParsedFlags.shortFlag ===
            newOptionParsedFlags.shortFlag)
      )
    ) {
      return false;
    }

    if (
      existingOptionParsedFlags.longFlag !== undefined &&
      newOptionParsedFlags.longFlag !== undefined &&
      existingOptionParsedFlags.longFlag !== newOptionParsedFlags.longFlag
    ) {
      throw new Error(
        `Long flag ${flags} already exists in the option list with flags: "${existingOption.flags}" and description: "${existingOption.description}"`
      );
    }

    if (
      existingOptionParsedFlags.shortFlag !== undefined &&
      newOptionParsedFlags.shortFlag !== undefined &&
      existingOptionParsedFlags.shortFlag !== newOptionParsedFlags.shortFlag
    ) {
      throw new Error(
        `Short flag ${flags} already exists in the option list with flags: "${existingOption.flags}" and description: "${existingOption.description}"`
      );
    }

    if (required !== existingOption.required) {
      throw new Error(
        `Flag ${flags} already exists in the option list with flags: "${existingOption.flags}" and description: "${existingOption.description}" but with different required status`
      );
    }

    if (optional !== existingOption.optional) {
      throw new Error(
        `Flag ${flags} already exists in the option list with flags: "${existingOption.flags}" and description: "${existingOption.description}" but with different optional status`
      );
    }

    if (mandatory !== existingOption.mandatory) {
      throw new Error(
        `Flag ${flags} already exists in the option list with flags: "${existingOption.flags}" and description: "${existingOption.description}" but with different mandatory status`
      );
    }

    if (variadic !== existingOption.variadic) {
      throw new Error(
        `Flag ${flags} already exists in the option list with flags: "${existingOption.flags}" and description: "${existingOption.description}" but with different variadic status`
      );
    }

    return existingOption;
  });
}

export function splitOptionFlags(flags: string) {
  let shortFlag;
  let longFlag;

  const flagParts = flags.split(/[ |,]+/);

  if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
    shortFlag = flagParts.shift();

  longFlag = flagParts.shift();

  if (!shortFlag && /^-[^-]$/.test(longFlag ?? '')) {
    shortFlag = longFlag;
    longFlag = undefined;
  }

  return { shortFlag, longFlag };
}
