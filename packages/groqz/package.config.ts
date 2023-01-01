import { defineConfig } from '@sanity/pkg-utils'

export default defineConfig({
  /*
  exports: (prevExports) => ({
    ...prevExports,

    // Build unexposed bundles for scripts that need to be spawned/used in workers
    './cli': {
      source: './src/cli.ts',
      require: './dist/cli.cjs',
      default: './dist/cli.cjs',
    },
  }),
  // */
})
