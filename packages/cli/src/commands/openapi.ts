import type { ParseOptions } from 'commander';
import { runOpenAPI } from './runOpenAPI.js';

export async function qraftOpenapi(
  processArgv: string[],
  processArgvParseOptions?: ParseOptions
) {
  const { RedoclyConfigCommand, OPENAPI_QRAFT_REDOC_CONFIG_KEY } =
    await import('@qraft/plugin/lib/RedoclyConfigCommand');

  const redoclyConfigParseResult = await new RedoclyConfigCommand(undefined, {
    configKey: OPENAPI_QRAFT_REDOC_CONFIG_KEY,
  }).parseConfig(runOpenAPI, processArgv, processArgvParseOptions);

  if (redoclyConfigParseResult?.length) return;

  await runOpenAPI(processArgv, processArgvParseOptions);
}
