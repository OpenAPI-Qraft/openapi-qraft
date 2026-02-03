import type { ParseOptions } from 'commander';
import { runAsyncAPI } from './runAsyncAPI.js';

export async function qraftAsyncapi(
  processArgv: string[],
  processArgvParseOptions?: ParseOptions
) {
  const { RedoclyConfigCommand, ASYNCAPI_QRAFT_REDOC_CONFIG_KEY } =
    await import('@qraft/plugin/lib/RedoclyConfigCommand');

  const redoclyConfigParseResult = await new RedoclyConfigCommand().parseConfig(
    { [ASYNCAPI_QRAFT_REDOC_CONFIG_KEY]: runAsyncAPI },
    processArgv,
    processArgvParseOptions
  );

  if (redoclyConfigParseResult?.length) return;

  await runAsyncAPI(processArgv, processArgvParseOptions);
}
