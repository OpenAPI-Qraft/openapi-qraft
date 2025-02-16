import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setupTests.ts',
    css: false,
    fakeTimers: {
      toFake: [
        // The "queueMicrotask" must not be used for the correct work of the `<QraftSecureRequestFn/>` component
        'setTimeout',
        'clearTimeout',
        'setImmediate',
        'clearImmediate',
        'setInterval',
        'clearInterval',
        'Date',
        'hrtime',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'requestIdleCallback',
        'cancelIdleCallback',
        'performance',
      ],
    },
    alias: [
      {
        find: '@openapi-qraft/react/callbacks',
        replacement: fileURLToPath(new URL('./src/callbacks', import.meta.url)),
      },
      {
        find: '@openapi-qraft/react',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
      {
        find: '@openapi-qraft/react/Unstable_QraftSecureRequestFn',
        replacement: fileURLToPath(
          new URL('./src/Unstable_QraftSecureRequestFn', import.meta.url)
        ),
      },
    ],
    coverage: {
      exclude: [
        'src/service-operation', // only types
        'src/**/*.type.ts', // only types
        'src/tests/**',
        'src/**/*.d.ts',
        'src/**/*.test.*',
        'src/**/*.spec.*',
      ],
    },
  },
});
