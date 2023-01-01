import { defineConfig } from '@sanity/pkg-utils'

export default defineConfig({
  exports: (prevExports) => ({
    ...prevExports,

    // Build unexposed bundles for scripts that need to be spawned/used in workers
    './getSchemaWorker': {
      source: './src/getSchemaWorker.ts',
      require: './dist/getSchemaWorker.cjs',
      default: './dist/getSchemaWorker.cjs',
    },
  }),
})
