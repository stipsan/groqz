// Based on https://github.com/statelyai/xstate-tools/tree/main/apps/cli

import { createIntrospectionDataset } from '@groqz/sanity'
import { watch } from 'chokidar'
import { Command } from 'commander'
import * as fs from 'fs/promises'
import * as path from 'path'

import { version } from '../../package.json'
import { extractMachinesFromFile } from './extractMachinesFromFile'
import { getTsTypesEdits } from './getTsTypesEdits'
import { getTypegenData } from './getTypegenData'
import { processFileEdits } from './processFileEdits'
import { writeToTypegenFile } from './writeToTypegenFile'

export * from './constants'
export * from './extractMachinesFromFile'
export * from './getMachineExtractResult'
export * from './getMachineNodesFromFile'
export * from './groupByUniqueName'
export * from './MachineExtractResult'
export * from './stateNode'
export * from './types'
export * from './utils'
export * from 'xstate/lib/types'

// TODO: just use the native one when support for node 12 gets dropped
const allSettled: typeof Promise.allSettled = (promises: Promise<any>[]) =>
  Promise.all(
    promises.map((promise) =>
      promise.then(
        (value) => ({ status: 'fulfilled' as const, value }),
        (reason) => ({ status: 'rejected' as const, reason })
      )
    )
  )

const program = new Command()

program.version(version)

const writeToFiles = async (uriArray: string[], workspace?: string) => {
  const dataset = await createIntrospectionDataset(workspace)
  console.log({ dataset })
  /**
   * TODO - implement pretty readout
   */
  await Promise.all(
    uriArray.map(async (uri) => {
      try {
        const fileContents = await fs.readFile(uri, 'utf8')

        const extracted = extractMachinesFromFile(fileContents)

        if (!extracted) {
          return
        }

        const types = extracted.machines
          .filter(
            (
              machineResult
            ): machineResult is NonNullable<typeof machineResult> =>
              !!machineResult?.machineCallResult.definition?.tsTypes?.node
          )
          .map((machineResult, index) =>
            getTypegenData(path.basename(uri), index, machineResult)
          )

        await writeToTypegenFile(uri, types)

        const edits = getTsTypesEdits(types)
        if (edits.length > 0) {
          const newFile = processFileEdits(fileContents, edits)
          await fs.writeFile(uri, newFile)
        }
        console.log(`${uri} - success`)
      } catch (e: any) {
        if (e?.code === 'BABEL_PARSER_SYNTAX_ERROR') {
          console.error(`${uri} - syntax error, skipping`)
        } else {
          console.error(`${uri} - error, `, e)
        }
        throw e
      }
    })
  )
}

program
  .command('typegen')
  .description('Generate TypeScript types from XState machines')
  .argument('<files>', 'The files to target, expressed as a glob pattern')
  .option('-w, --watch', 'Run the typegen in watch mode')
  .action(async (filesPattern: string, opts: { watch?: boolean }) => {
    if (opts.watch) {
      // TODO: implement per path queuing to avoid tasks related to the same file from overlapping their execution
      const processFile = (path: string) => {
        if (path.endsWith('.typegen.ts')) {
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        writeToFiles([path]).catch((err) => {
          console.error(err)
          throw err
        })
      }
      // TODO: handle removals
      watch(filesPattern, { awaitWriteFinish: true })
        .on('add', processFile)
        .on('change', processFile)
    } else {
      const tasks: Array<Promise<void>> = []
      // TODO: could this cleanup outdated typegen files?
      watch(filesPattern, { persistent: false })
        .on('add', (path) => {
          console.log('add', path)
          if (path.endsWith('.typegen.ts')) {
            return
          }

          tasks.push(
            writeToFiles([path]).catch((err) => {
              console.error(err)
              throw err
            })
          )
        })
        .on('ready', async () => {
          const settled = await allSettled(tasks)
          if (settled.some((result) => result.status === 'rejected')) {
            process.exit(1)
          }
          process.exit(0)
        })
    }
  })

program.parse(process.argv)
