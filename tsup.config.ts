import { defineConfig } from 'tsup';

export default defineConfig([
  // Library build (CJS + ESM)
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: false,
    splitting: false,
    treeshake: true,
  },
  // CLI build (ESM with shebang)
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: false,
    clean: false,
    sourcemap: false,
    splitting: false,
    treeshake: true,
    shims: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
