import { defineConfig } from '@sanity/pkg-utils'

export default defineConfig({
  exports: (prevExports) => ({
    ...prevExports,

    // Build unexposed bundles for scripts that need to be spawned/used in workers
    './getGraphQLAPIsWorker': {
      source: './src/getGraphQLAPIsWorker.ts',
      require: './dist/getGraphQLAPIsWorker.cjs',
      default: './dist/getGraphQLAPIsWorker.cjs',
    },
  }),
})
