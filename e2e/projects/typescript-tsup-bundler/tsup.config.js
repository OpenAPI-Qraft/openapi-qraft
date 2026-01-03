export default {
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  clean: true,
  minify: false,
  splitting: false,
  sourcemap: true,
  dts: true,
  outDir: './dist',
};
