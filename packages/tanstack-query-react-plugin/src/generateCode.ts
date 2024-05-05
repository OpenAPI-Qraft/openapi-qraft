import { formatFileHeader } from '@openapi-qraft/plugin/lib/formatFileHeader';
import { GeneratorFile } from '@openapi-qraft/plugin/lib/GeneratorFile';
import { Service } from '@openapi-qraft/plugin/lib/open-api/getServices';
import { OutputOptions as OutputOptionsBase } from '@openapi-qraft/plugin/lib/OutputOptions';

import c from 'ansi-colors';
import { URL } from 'node:url';
import { Ora } from 'ora';

import { astToString } from './ts-factory/astToString.js';
import { getClientFactory } from './ts-factory/getClientFactory.js';
import { getIndexFactory } from './ts-factory/getIndexFactory.js';
import {
  getServiceFactory,
  ServiceImportsFactoryOptions,
} from './ts-factory/getServiceFactory.js';
import { getServiceIndexFactory } from './ts-factory/getServiceIndexFactory.js';

interface OutputOptions extends OutputOptionsBase {
  fileHeader: string | undefined;
  servicesDirName: string;
  explicitImportExtensions: boolean;
}

export const generateCode = async ({
  spinner,
  services,
  serviceImports,
  output,
}: {
  spinner: Ora;
  services: Service[];
  serviceImports: ServiceImportsFactoryOptions;
  output: OutputOptions;
}) => {
  return [
    ...(await generateServices(spinner, services, serviceImports, output)),
    ...(await generateServiceIndex(spinner, services, output)),
    ...(await generateClient(spinner, output)),
    ...(await generateIndex(spinner, output)),
  ];
};

const composeServicesDirPath = (
  output: Pick<OutputOptions, 'servicesDirName' | 'dir'>
) => {
  return new URL(`${output.servicesDirName}/`, output.dir);
};

const generateServices = async (
  spinner: Ora,
  services: Service[],
  serviceImports: ServiceImportsFactoryOptions,
  output: OutputOptions
) => {
  const servicesDir = composeServicesDirPath(output);

  spinner.start('Generating services');

  const serviceFiles: GeneratorFile[] = [
    {
      directory: servicesDir,
      clean: output.clean,
    },
  ];

  for (const service of services) {
    const { operations, name, typeName, variableName, fileBaseName } = service;

    spinner.text = `Generating ${c.magenta(name)} service`;

    try {
      const code = astToString(
        getServiceFactory(
          {
            typeName,
            variableName,
          },
          operations,
          serviceImports
        )
      );

      serviceFiles.push({
        file: new URL(`${fileBaseName}.ts`, servicesDir),
        code: formatFileHeader(output.fileHeader) + code,
      });
    } catch (error) {
      spinner.fail(
        c.redBright(
          `Error occurred during ${c.magenta(name)} service generation`
        )
      );

      throw error;
    }
  }

  spinner.succeed(c.green('Services has been generated'));

  return serviceFiles;
};

const generateServiceIndex = async (
  spinner: Ora,
  services: Service[],
  output: OutputOptions
) => {
  spinner.start('Generating services index');

  const serviceIndexFiles: GeneratorFile[] = [
    {
      directory: composeServicesDirPath(output),
      clean: output.clean,
    },
  ];

  try {
    const code = astToString(
      getServiceIndexFactory(services, {
        explicitImportExtensions: Boolean(output.explicitImportExtensions),
      })
    );

    serviceIndexFiles.push({
      file: new URL('index.ts', composeServicesDirPath(output)),
      code: formatFileHeader(output.fileHeader) + code,
    });
  } catch (error) {
    spinner.fail(
      c.redBright('Error occurred during services index generation')
    );

    throw error;
  }

  spinner.succeed(c.green('Services index has been generated'));

  return serviceIndexFiles;
};

const generateClient = async (spinner: Ora, output: OutputOptions) => {
  spinner.start('Generating client');

  const clientFiles: GeneratorFile[] = [];

  try {
    const code = astToString(
      getClientFactory({
        servicesDirName: output.servicesDirName,
        explicitImportExtensions: Boolean(output.explicitImportExtensions),
      })
    );

    clientFiles.push({
      file: new URL('create-api-client.ts', output.dir),
      code: formatFileHeader(output.fileHeader) + code,
    });
  } catch (error) {
    spinner.fail(c.redBright('Error occurred during client generation'));

    throw error;
  }

  spinner.succeed(c.green('Client has been generated'));

  return clientFiles;
};

const generateIndex = async (spinner: Ora, output: OutputOptions) => {
  spinner.start('Generating index');

  const indexFiles: GeneratorFile[] = [];

  try {
    const code = astToString(
      getIndexFactory({
        servicesDirName: output.servicesDirName,
        explicitImportExtensions: Boolean(output.explicitImportExtensions),
      })
    );

    indexFiles.push({
      file: new URL('index.ts', output.dir),
      code: formatFileHeader(output.fileHeader) + code,
    });
  } catch (error) {
    spinner.fail(c.redBright('Error occurred during index generation'));

    throw error;
  }

  spinner.succeed(c.green('Index has been generated'));

  return indexFiles;
};
