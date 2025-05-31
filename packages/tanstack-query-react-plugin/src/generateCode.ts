import type { OverrideImportType } from './ts-factory/OverrideImportType.js';
import { URL } from 'node:url';
import { formatFileHeader } from '@openapi-qraft/plugin/lib/formatFileHeader';
import { GeneratorFile } from '@openapi-qraft/plugin/lib/GeneratorFile';
import { OpenAPIService } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import { OutputOptions as OutputOptionsBase } from '@openapi-qraft/plugin/lib/OutputOptions';
import { PredefinedParametersGlob } from '@openapi-qraft/plugin/lib/predefineSchemaParameters';
import c from 'ansi-colors';
import { Ora } from 'ora';
import { astToString } from './ts-factory/astToString.js';
import { getCreateAPIClientFactory } from './ts-factory/getCreateAPIClientFactory.js';
import { getCreatePredefinedParametersRequestFnFactory } from './ts-factory/getCreatePredefinedParametersRequestFnFactory.js';
import {
  CreateAPIClientFnOptions,
  getIndexFactory,
} from './ts-factory/getIndexFactory.js';
import {
  getServiceFactory,
  ServiceFactoryOptions,
} from './ts-factory/getServiceFactory.js';
import { getServiceIndexFactory } from './ts-factory/getServiceIndexFactory.js';

interface OutputOptions extends OutputOptionsBase {
  fileHeader: string | undefined;
  servicesDirName: string;
  explicitImportExtensions: '.js' | '.ts' | undefined;
  exportSchemaTypes: boolean | undefined;
  operationPredefinedParameters: Array<PredefinedParametersGlob> | undefined;
  createApiClientFn: Array<
    [functionName: string, value: CreateAPIClientFnOptions]
  >;
}

export const generateCode = async ({
  spinner,
  services,
  serviceOptions,
  output,
  overrideImportType,
}: {
  spinner: Ora;
  services: OpenAPIService[];
  serviceOptions: ServiceFactoryOptions;
  output: OutputOptions;
  overrideImportType: OverrideImportType | undefined;
}) => {
  return [
    ...(await generateServices(
      spinner,
      services,
      serviceOptions,
      output,
      overrideImportType
    )),
    ...(await generateServiceIndex(spinner, services, output)),
    ...(await generateOperationClient(spinner, output, overrideImportType)),
    ...(output.operationPredefinedParameters
      ? await generateCreatePredefinedParametersRequestFn(
          spinner,
          serviceOptions,
          output
        )
      : []),
    ...(await generateIndex(spinner, serviceOptions, output)),
  ];
};

const composeServicesDirPath = (
  output: Pick<OutputOptions, 'servicesDirName' | 'dir'>
) => {
  return new URL(`${output.servicesDirName}/`, output.dir);
};

const generateServices = async (
  spinner: Ora,
  services: OpenAPIService[],
  serviceImports: ServiceFactoryOptions,
  output: OutputOptions,
  overrideImportType: OverrideImportType | undefined
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
          serviceImports,
          overrideImportType?.[output.servicesDirName]
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
  services: OpenAPIService[],
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
    const code = astToString(getServiceIndexFactory(services, output));

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

const generateOperationClient = async (
  spinner: Ora,
  output: OutputOptions,
  overrideImportType: OverrideImportType | undefined
) => {
  spinner.start('Generating operation client');

  const operationClientFiles: GeneratorFile[] = [];

  try {
    output.createApiClientFn.map(([functionName, value]) => {
      const fileName = value.filename?.[0] ?? functionName;

      const code = astToString(
        getCreateAPIClientFactory({
          defaultClientCallbacks: value.callbacks,
          defaultClientServices: value.services,
          createAPIClientFnName: functionName,
          servicesDirName: output.servicesDirName,
          explicitImportExtensions: output.explicitImportExtensions,
          createAPIClientFnImportTypeOverrides: overrideImportType?.[fileName],
        })
      );

      operationClientFiles.push({
        file: new URL(`${fileName}.ts`, output.dir),
        code: formatFileHeader(output.fileHeader) + code,
      });
    });
  } catch (error) {
    spinner.fail(
      c.redBright('Error occurred during operation client generation')
    );

    throw error;
  }

  spinner.succeed(c.green('Operation client has been generated'));

  return operationClientFiles;
};

const generateCreatePredefinedParametersRequestFn = async (
  spinner: Ora,
  serviceImports: ServiceFactoryOptions,
  output: OutputOptions
) => {
  spinner.start('Generating "createPredefinedParametersRequestFn"');

  const clientFiles: GeneratorFile[] = [];

  try {
    const code = astToString(
      getCreatePredefinedParametersRequestFnFactory({
        servicesDirName: output.servicesDirName,
        operationPredefinedParameters: output.operationPredefinedParameters,
        openapiTypesImportPath: serviceImports.openapiTypesImportPath,
      })
    );

    clientFiles.push({
      file: new URL('create-predefined-parameters-request-fn.ts', output.dir),
      code: formatFileHeader(output.fileHeader) + code,
    });
  } catch (error) {
    spinner.fail(
      c.redBright(
        'Error occurred during "createPredefinedParametersRequestFn" generation'
      )
    );

    throw error;
  }

  spinner.succeed(
    c.green('"createPredefinedParametersRequestFn" has been generated')
  );

  return clientFiles;
};

const generateIndex = async (
  spinner: Ora,
  serviceImports: ServiceFactoryOptions,
  output: OutputOptions
) => {
  spinner.start('Generating index');

  const indexFiles: GeneratorFile[] = [];

  try {
    const code = astToString(
      getIndexFactory({
        ...output,
        openapiTypesImportPath: output.exportSchemaTypes
          ? serviceImports.openapiTypesImportPath
          : undefined,
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
