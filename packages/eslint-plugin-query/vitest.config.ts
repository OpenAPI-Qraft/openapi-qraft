import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['./dist/**'],
    globals: true,
    environment: 'node',
    css: false,
    coverage: {
      include: ['src/**/*'],
      exclude: [
        'src/__tests__/**',
        'src/index.ts',
        'src/rules.ts',
        'src/**/*.d.ts',
      ],
    },
  },
});
