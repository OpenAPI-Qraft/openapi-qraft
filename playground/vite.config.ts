import { qraftTreeShakeVite } from '@openapi-qraft/tree-shaking-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    qraftTreeShakeVite({
      createAPIClientFn: [
        {
          name: 'createPlaygroundAPIClient',
          module: './api',
          context: 'PlaygroundAPIClientContext',
        },
      ],
    }),
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-react-compiler',
            {
              panicThreshold: 'all_errors',
            },
          ],
        ],
      },
    }),
  ],
  build: {
    minify: false,
  },
});
