import { defineConfig } from '@sanity/pkg-utils'

export default defineConfig({
  exports: (prevExports) => ({
    ...prevExports,

    // Build unexposed bundles for scripts that need to be spawned/used in workers
    './resolveStudioConfigWorker': {
      source: './src/resolveStudioConfigWorker.ts',
      require: './dist/resolveStudioConfigWorker.cjs',
      default: './dist/resolveStudioConfigWorker.cjs',
    },
  }),
})
