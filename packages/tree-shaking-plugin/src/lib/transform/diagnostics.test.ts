import { describe, expect, it, vi } from 'vitest';
import {
  createDiagnosticReporter,
  QraftTreeShakeError,
} from './diagnostics.js';

describe('tree-shaking diagnostics', () => {
  it('throws unresolved transform candidates by default', () => {
    const reporter = createDiagnosticReporter({});

    expect(() =>
      reporter.unresolved({
        layer: 'generated-metadata',
        code: 'generated-services-import-missing',
        message: 'Generated factory does not statically import services.',
        entrypointKey: 'generatedFactory:createAPIClient:./api',
      })
    ).toThrow(QraftTreeShakeError);
  });

  it('warns and continues when diagnostics is warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const reporter = createDiagnosticReporter({ diagnostics: 'warn' });

    expect(
      reporter.unresolved({
        layer: 'generated-metadata',
        code: 'entrypoint-source-unavailable',
        message: 'Generated source was unavailable.',
        entrypointKey: 'generatedFactory:createAPIClient:./api',
      })
    ).toBeNull();

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        '[openapi-qraft/tree-shaking-plugin] entrypoint-source-unavailable'
      )
    );

    warn.mockRestore();
  });

  it('stays silent when diagnostics is off', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const reporter = createDiagnosticReporter({ diagnostics: 'off' });

    expect(
      reporter.unresolved({
        layer: 'generated-metadata',
        code: 'operation-source-unresolved',
        message: 'Operation source was not resolved.',
      })
    ).toBeNull();

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('ordinary skips never throw or warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const reporter = createDiagnosticReporter({});

    expect(
      reporter.ordinarySkip({
        layer: 'gate',
        code: 'source-gate-no-signals',
        message: 'Source contains no configured entrypoint signals.',
      })
    ).toBeNull();

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
