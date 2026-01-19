import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
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
