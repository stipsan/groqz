/**
 * Lifted from https://github.com/sanity-io/sanity/blob/d7145405506388e86f2e122e3bdf686f9cbde997/packages/sanity/src/_internal/cli/actions/graphql/getGraphQLAPIs.ts
 */

import type { CliCommandContext, CliV3CommandContext } from '@sanity/cli'
import path from 'path'
import readPkgUp from 'read-pkg-up'
import { createSchema } from 'sanity'
import { Worker } from 'worker_threads'

import type {
  ResolvedGraphQLAPI,
  ResolvedSourceProperties,
  SchemaDefinitionish,
  TypeResolvedGraphQLAPI,
} from './graphqlTypes'

export { ResolvedGraphQLAPI, ResolvedSourceProperties }

/** @alpha */
export async function getGraphQLAPIs(
  cliContext: CliCommandContext
): Promise<ResolvedGraphQLAPI[]> {
  if (!isModernCliConfig(cliContext)) {
    throw new Error('Expected Sanity studio of version 3 or above')
  }

  const defaultSchema = createSchema({ name: 'default', types: [] })
  const defaultTypes = defaultSchema.getTypeNames()
  const isCustomType = (type: SchemaDefinitionish) =>
    !defaultTypes.includes(type.name)

  const apis = await getApisWithSchemaTypes(cliContext)
  const resolved = apis.map(
    ({ schemaTypes, ...api }): ResolvedSourceProperties => ({
      schema: createSchema({
        name: 'default',
        types: schemaTypes.filter(isCustomType),
      }),
      ...api,
    })
  )

  return resolved
}

function getApisWithSchemaTypes(
  cliContext: CliCommandContext
): Promise<TypeResolvedGraphQLAPI[]> {
  return new Promise<TypeResolvedGraphQLAPI[]>((resolve, reject) => {
    const { cliConfig, cliConfigPath, workDir } = cliContext
    const rootPkgPath = readPkgUp.sync({ cwd: __dirname })?.path
    if (!rootPkgPath) {
      throw new Error('Could not find root directory for `sanity` package')
    }

    const rootDir = path.dirname(rootPkgPath)
    const workerPath = path.join(rootDir, 'dist', 'getGraphQLAPIsWorker.cjs')
    const worker = new Worker(workerPath, {
      workerData: { cliConfig: serialize(cliConfig), cliConfigPath, workDir },
    })
    worker.on('message', resolve)
    worker.on('error', reject)
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
    })
  })
}

function isModernCliConfig(
  config: CliCommandContext
): config is CliV3CommandContext {
  return config.sanityMajorVersion >= 3
}

function serialize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}
