import camelCase from 'camelcase';
import chalk from 'chalk';
import fs from 'node:fs';
import { resolve } from 'node:path';
import ora from 'ora';

import { getServices, ServiceOperation } from './lib/open-api/getServices.js';
import { readSchemaFromFile } from './lib/open-api/readSchemaFromFile.js';
import { astToString } from './lib/ts-factory/astToString.js';
import { getServiceFactory } from './lib/ts-factory/getServiceFactory.js';

export const writeOpenAPISchemaServices = async (
  openAPIFilePath: string,
  servicesOutDir: string
) => {
  const schema = await readSchemaFromFile(openAPIFilePath);
  const services = getServices(schema);
  await writeServices(services, servicesOutDir);
};

const writeServices = async (
  services: Record<string, ServiceOperation[]>,
  outputDir: string
) => {
  await fs.promises.mkdir(outputDir, { recursive: true });

  const spinner = ora(`Generating services`).start();

  let hasSuccessfulGeneration = false;
  let hasFailedGeneration = false;

  for (const [serviceName, operations] of Object.entries(services)) {
    spinner.text = `Generating ${chalk.magenta(serviceName)} service`;

    try {
      const services = generateService(serviceName, operations);

      await fs.promises.writeFile(
        resolve(outputDir, `${serviceName}.ts`),
        services
      );
      hasSuccessfulGeneration = true;
    } catch (error) {
      spinner.warn(
        chalk.redBright(
          `Error occurred during ${chalk.magenta(
            serviceName
          )} service generation`
        )
      );
      console.error(serviceName, error);
      hasFailedGeneration = true;
    }
  }

  if (!hasSuccessfulGeneration) {
    spinner.fail(chalk.red('Services has not been generated'));
    throw new Error('Services has not been generated');
  }

  if (hasFailedGeneration) {
    spinner.info(chalk.yellow('Services has been generated with warnings'));
    throw new Error('Services has been generated with warnings');
  }

  spinner.succeed(chalk.green('Services has been generated'));
};

const generateService = (
  serviceName: string,
  operations: ServiceOperation[]
) => {
  const serviceFactory = getServiceFactory(
    {
      typeName: serviceName,
      variableName: camelCase(serviceName, {
        preserveConsecutiveUppercase: false,
      }),
    },
    operations
  );

  return astToString(serviceFactory);
};
