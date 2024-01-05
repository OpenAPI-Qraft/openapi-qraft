import camelCase from 'camelcase';
import chalk from 'chalk';
import fs from 'node:fs';
import { resolve } from 'node:path';
import ora from 'ora';

import { getServices, ServiceOperation } from './lib/open-api/getServices.js';
import { readSchemaFromFile } from './lib/open-api/readSchemaFromFile.js';
import { astToString } from './lib/ts-factory/astToString.js';
import {
  getServiceFactory,
  ServiceFactoryOptions,
} from './lib/ts-factory/getServiceFactory.js';

export const writeOpenAPISchemaServices = async ({
  schemaDeclarationPath,
  servicesOutDir,
  schemaTypesPath,
  operationGenericsPath,
  fileHeader,
}: ServiceFactoryOptions & {
  schemaDeclarationPath: string;
  servicesOutDir: string;
  fileHeader?: string;
}) => {
  const schema = await readSchemaFromFile(schemaDeclarationPath);
  const services = getServices(schema);
  const servicesCode = generateServices(services, {
    schemaTypesPath,
    operationGenericsPath,
    fileHeader,
  });
  await writeServices(servicesCode, servicesOutDir);
};

const generateServices = (
  services: Record<string, ServiceOperation[]>,
  options: ServiceFactoryOptions & { fileHeader?: string }
) => {
  const spinner = ora(`Generating services`).start();

  const generatedServices: Record<string, string> = {};

  for (const [serviceName, operations] of Object.entries(services)) {
    spinner.text = `Generating ${chalk.magenta(serviceName)} service`;

    try {
      generatedServices[serviceName] =
        (options.fileHeader && `${options.fileHeader}\n`) +
        astToString(
          getServiceFactory(
            {
              typeName: serviceName,
              variableName: camelCase(serviceName, {
                preserveConsecutiveUppercase: false,
              }),
            },
            operations,
            options
          )
        );
    } catch (error) {
      spinner.fail(
        chalk.redBright(
          `Error occurred during ${chalk.magenta(
            serviceName
          )} service generation`
        )
      );

      throw error;
    }
  }

  spinner.succeed(chalk.green('Services has been generated'));

  return generatedServices;
};

const writeServices = async (
  services: { [serviceName: string]: string },
  outputDir: string
) => {
  await fs.promises.mkdir(outputDir, { recursive: true });

  const spinner = ora(`Writing services`).start();

  for (const [serviceName, serviceCode] of Object.entries(services)) {
    spinner.text = `Writing ${chalk.magenta(serviceName)} service`;

    try {
      await fs.promises.writeFile(
        resolve(outputDir, `${serviceName}.ts`),
        serviceCode
      );
    } catch (error) {
      spinner.fail(
        chalk.redBright(
          `Error occurred during ${chalk.magenta(serviceName)} service writing`
        )
      );

      throw error;
    }
  }

  spinner.succeed(chalk.green('Services has been written'));
};
