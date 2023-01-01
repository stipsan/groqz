/**
 * Lifted from https://github.com/sanity-io/sanity/blob/d7145405506388e86f2e122e3bdf686f9cbde997/packages/sanity/src/_internal/cli/actions/graphql/getGraphQLAPIs.ts
 */

import type { Json } from '@groqz/json'
import type { CliV3CommandContext } from '@sanity/cli'
import path from 'path'
import readPkgUp from 'read-pkg-up'
import * as url from 'url'
import { Worker } from 'worker_threads'

export * from '@groqz/json'

/** @alpha */
export async function getSchema({
  workspace,
  workDir,
}: {
  workspace?: string
} & Pick<CliV3CommandContext, 'workDir'>): Promise<{
  projectId: string
  dataset: string
  introspectionDataset: Json[]
}> {
  return new Promise<{
    projectId: string
    dataset: string
    introspectionDataset: Json[]
  }>((resolve, reject) => {
    let cwd: string
    try {
      cwd = url.fileURLToPath(new URL('.', import.meta.url))
    } catch {
      cwd = __dirname
    }
    const rootPkgPath = readPkgUp.sync({ cwd })?.path
    if (!rootPkgPath) {
      throw new Error(
        'Could not find root directory for the `@groqz/sanity` package'
      )
    }

    const rootDir = path.dirname(rootPkgPath)
    const workerPath = path.join(rootDir, 'dist', 'getSchemaWorker.cjs')
    const worker = new Worker(workerPath, {
      workerData: { workspace, workDir },
    })
    worker.on('message', resolve)
    worker.on('error', reject)
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
    })
  })
}
