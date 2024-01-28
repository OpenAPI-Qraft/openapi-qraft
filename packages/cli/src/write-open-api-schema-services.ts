import chalk from 'chalk';
import fs from 'node:fs';
import { resolve } from 'node:path';
import { Readable } from 'node:stream';
import { OpenAPI3 } from 'openapi-typescript';
import ora from 'ora';

import { getServices, Service } from './lib/open-api/getServices.js';
import { readSchema } from './lib/open-api/readSchema.js';
import { astToString } from './lib/ts-factory/astToString.js';
import {
  getServiceFactory,
  ServiceImportsFactoryOptions,
} from './lib/ts-factory/getServiceFactory.js';
import { getServiceIndexFactory } from './lib/ts-factory/getServiceIndexFactory.js';

type OutputOptions = {
  fileHeader?: string;
  dir: string;
  clean: boolean;
  postfixServices?: string;
};

export const writeOpenAPISchemaServices = async ({
  source,
  serviceImports,
  output,
}: {
  source: string | URL | OpenAPI3 | Readable | Buffer;
  serviceImports: ServiceImportsFactoryOptions;
  output: OutputOptions;
}) => {
  const schema = await readSchema(source);
  const services = getServices(schema, output);

  await writeServices(services, output, servicesDirName, serviceImports);
  await writeServiceIndex(services, output, servicesDirName);
};

const writeServices = async (
  services: Service[],
  output: OutputOptions,
  servicesDirName: string,
  serviceImports: ServiceImportsFactoryOptions
) => {
  const servicesDir = resolve(output.dir, servicesDirName);

  if (output.clean)
    await fs.promises.rm(servicesDir, {
      recursive: true,
      force: true,
    });

  await fs.promises.mkdir(servicesDir, { recursive: true });

  const spinner = ora(`Generating services`).start();

  for (const service of services) {
    const { operations, name, typeName, variableName, fileBaseName } = service;

    spinner.text = `Generating ${chalk.magenta(name)} service`;

    try {
      const code =
        getFileHeader(output) +
        astToString(
          getServiceFactory(
            {
              typeName,
              variableName,
            },
            operations,
            serviceImports
          )
        );

      await fs.promises.writeFile(
        resolve(servicesDir, `${fileBaseName}.ts`),
        code
      );
    } catch (error) {
      spinner.fail(
        chalk.redBright(
          `Error occurred during ${chalk.magenta(name)} service generation`
        )
      );

      throw error;
    }
  }

  spinner.succeed(chalk.green('Services has been generated'));
};

const writeServiceIndex = async (
  services: Service[],
  output: OutputOptions,
  servicesDirName: string
) => {
  const spinner = ora('Generating services index').start();

  try {
    const code =
      getFileHeader(output) +
      astToString(getServiceIndexFactory(services, { servicesDirName }));

    await fs.promises.writeFile(resolve(output.dir, 'index.ts'), code);
  } catch (error) {
    spinner.fail(
      chalk.redBright('Error occurred during services index generation')
    );

    throw error;
  }

  spinner.succeed(chalk.green('Services index has been generated'));
};

const getFileHeader = ({ fileHeader }: Pick<OutputOptions, 'fileHeader'>) => {
  return fileHeader && `${fileHeader}\n`;
};

const servicesDirName = 'services';
