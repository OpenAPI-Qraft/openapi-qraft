import chalk from 'chalk';
import fs from 'node:fs';
import { resolve } from 'node:path';
import ora from 'ora';

import { getServices, Service } from './lib/open-api/getServices.js';
import { readSchemaFromFile } from './lib/open-api/readSchemaFromFile.js';
import { astToString } from './lib/ts-factory/astToString.js';
import {
  getServiceFactory,
  ServiceImportsFactoryOptions,
} from './lib/ts-factory/getServiceFactory.js';

type OutputOptions = {
  fileHeader?: string;
  dir: string;
  clean: boolean;
};

export const writeOpenAPISchemaServices = async ({
  sourcePath,
  serviceImports,
  output,
}: {
  sourcePath: string;
  serviceImports: ServiceImportsFactoryOptions;
  output: OutputOptions;
}) => {
  const schema = await readSchemaFromFile(sourcePath);
  const services = getServices(schema);
  await writeServices(services, serviceImports, output);
};

const writeServices = async (
  services: Service[],
  serviceImports: ServiceImportsFactoryOptions,
  output: OutputOptions
) => {
  const servicesOutputDir = resolve(output.dir, 'services');

  if (output.clean)
    await fs.promises.rm(servicesOutputDir, { recursive: true, force: true });

  await fs.promises.mkdir(servicesOutputDir, { recursive: true });

  const spinner = ora(`Generating services`).start();

  const generatedServices: Record<
    string,
    Omit<Service, 'operations'> & { code: string }
  > = {};

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
        resolve(servicesOutputDir, `${fileBaseName}.ts`),
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

  return generatedServices;
};

const getFileHeader = ({ fileHeader }: Pick<OutputOptions, 'fileHeader'>) => {
  return fileHeader && `${fileHeader}\n`;
};
