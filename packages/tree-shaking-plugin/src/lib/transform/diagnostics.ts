import type {
  QraftModuleAccessTraceEntry,
  QraftModuleAccessTraceStage,
} from '../resolvers/common.js';
import type {
  DiagnosticLayer,
  DiagnosticReason,
  DiagnosticsLevel,
  QraftTreeShakeOptions,
} from './types.js';

export type { DiagnosticLayer, DiagnosticReason, DiagnosticsLevel };

export class QraftTreeShakeError extends Error {
  readonly reason: DiagnosticReason;

  constructor(reason: DiagnosticReason) {
    super(formatDiagnosticReason(reason));
    this.name = 'QraftTreeShakeError';
    this.reason = reason;
  }
}

export type DiagnosticReporter = {
  ordinarySkip(reason: DiagnosticReason): null;
  unresolved(reason: DiagnosticReason): null;
};

export function createDiagnosticReporter(
  options: Pick<QraftTreeShakeOptions, 'diagnostics'>
): DiagnosticReporter {
  const diagnostics = normalizeDiagnosticsLevel(options);

  return {
    ordinarySkip() {
      return null;
    },
    unresolved(reason) {
      if (diagnostics === 'error') {
        throw new QraftTreeShakeError(reason);
      }

      if (diagnostics === 'warn') {
        console.warn(formatDiagnosticReason(reason));
      }

      return null;
    },
  };
}

export function formatDiagnosticReason(reason: DiagnosticReason): string {
  const entrypoint = reason.entrypointKey
    ? ` entrypoint=${reason.entrypointKey}`
    : '';
  const trace = formatModuleAccessTrace(reason.moduleAccessTrace);

  return `[openapi-qraft/tree-shaking-plugin] ${reason.code} (${reason.layer})${entrypoint}: ${reason.message}${trace}`;
}

function formatModuleAccessTrace(
  trace: QraftModuleAccessTraceEntry[] | undefined
): string {
  if (!trace?.length) return '';

  return `\n\n${trace.map(formatModuleAccessTraceEntry).join('\n')}`;
}

function formatModuleAccessTraceEntry(entry: QraftModuleAccessTraceEntry) {
  const header =
    entry.kind === 'resolve'
      ? `resolve ${JSON.stringify(entry.target)} from ${JSON.stringify(entry.importer)}:`
      : `load ${JSON.stringify(entry.target)}:`;
  const stages = entry.stages.map((stage) => `  ${formatTraceStage(stage)}`);

  return [header, ...stages].join('\n');
}

function formatTraceStage(stage: QraftModuleAccessTraceStage) {
  const detail = stage.value ?? stage.message;
  return `${stage.name}: ${stage.result}${detail ? ` ${detail}` : ''}`;
}

function normalizeDiagnosticsLevel(
  options: Pick<QraftTreeShakeOptions, 'diagnostics'>
): DiagnosticsLevel {
  if (options.diagnostics) return options.diagnostics;
  return 'error';
}
