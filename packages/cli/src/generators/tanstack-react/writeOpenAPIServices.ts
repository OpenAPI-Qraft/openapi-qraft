import c from 'ansi-colors';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import { URL } from 'node:url';
import { OpenAPI3 } from 'openapi-typescript';
import ora, { Ora } from 'ora';

import { getServices } from '../../lib/open-api/getServices.js';
import { readSchema } from '../../lib/open-api/readSchema.js';
import { OutputOptions } from '../../lib/OutputOptions.js';
import { generateCode, GeneratorFiles, getFileHeader } from './generateCode.js';
import { ServiceImportsFactoryOptions } from './ts-factory/getServiceFactory.js';

export const writeOpenAPIServices = async ({
  source,
  servicesGlob,
  serviceImports,
  output,
}: {
  source: string | URL | OpenAPI3 | Readable | Buffer;
  servicesGlob: string[] | undefined;
  serviceImports: ServiceImportsFactoryOptions;
  output: OutputOptions;
}) => {
  const schema = await readSchema(source);
  const services = getServices(schema, output, servicesGlob);

  const spinner = ora('Starting generation').start();

  const fileItems = await generateCode({
    spinner,
    services,
    serviceImports,
    output,
  });

  await setupDirectories(spinner, fileItems);
  await writeFiles(spinner, fileItems, output);

  spinner.succeed(c.green('Services has been generated'));
};

const setupDirectories = async (spinner: Ora, fileItems: GeneratorFiles) => {
  for (const fileItem of fileItems) {
    if (!('directory' in fileItem)) continue;

    if (fileItem.clean) {
      spinner.text = `Cleaning ${c.magenta(fileItem.directory.pathname)}`;

      try {
        await fs.promises.rm(fileItem.directory, {
          recursive: true,
          force: true,
        });
      } catch (error) {
        spinner.fail(
          c.redBright(
            `Error occurred during ${c.magenta(
              fileItem.directory.pathname
            )} directory cleaning`
          )
        );

        throw error;
      }
    }

    try {
      spinner.text = `Creating directory ${c.magenta(fileItem.directory.pathname)}`;

      await fs.promises.mkdir(fileItem.directory, { recursive: true });
    } catch (error) {
      spinner.fail(
        c.redBright(
          `Error occurred during ${c.magenta(
            fileItem.directory.pathname
          )} directory creation`
        )
      );

      throw error;
    }
  }
};

const writeFiles = async (
  spinner: Ora,
  fileItems: GeneratorFiles,
  output: Pick<OutputOptions, 'fileHeader'>
) => {
  for (const fileItem of fileItems) {
    if ('directory' in fileItem) continue;

    const { file, code } = fileItem;

    spinner.text = `Writing ${c.magenta(file.pathname)}`;

    try {
      await fs.promises.writeFile(file, code, {
        encoding: 'utf-8',
      });
    } catch (error) {
      spinner.fail(
        c.redBright(
          `Error occurred during ${c.magenta(file.pathname)} file writing`
        )
      );

      throw error;
    }
  }
};
