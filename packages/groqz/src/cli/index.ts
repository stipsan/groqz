/* eslint-disable @typescript-eslint/ban-ts-comment */
// Based on https://github.com/statelyai/xstate-tools/tree/main/apps/cli

import * as t from '@babel/types'
import { createIntrospectionDataset } from '@groqz/sanity'
import { type EvaluateOptions } from '@groqz/to-ts'
import { watch } from 'chokidar'
import { Command } from 'commander'
import * as fs from 'fs/promises'
import * as path from 'path'
import { string } from 'zod'
import * as prettier from 'prettier'

import { version } from '../../package.json'
import { extractQueriesFromFile } from './extractQueriesFromFile'
import { getTsTypesEdits } from './getTsTypesEdits'
import { getTypegenData } from './getTypegenData'
import { getTypegenOutput } from './getTypegenOutput'
import { processFileEdits } from './processFileEdits'
import { writeToTypegenFile } from './writeToTypegenFile'

export * from './constants'
export * from './extractQueriesFromFile'
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
  const options: EvaluateOptions = { dataset }
  console.log({ dataset })
  /**
   * TODO - implement pretty readout
   */
  await Promise.all(
    uriArray.map(async (uri) => {
      try {
        const fileContents = await fs.readFile(uri, 'utf8')
        const fileHasChanged = async () => {
          return fileContents !== await fs.readFile(uri, 'utf8')
        }

        const extracted = extractQueriesFromFile(fileContents)

        console.-log({ extracted })

        if (!extracted) {
          return
        }

        const types = extracted.nodes.map((node, index) => ({
          node,
          query:
            (t.isTSAsExpression(node) &&
            t.isTaggedTemplateExpression(node.expression)
              ? node.expression.quasi.quasis[0].value.cooked
              : t.isTaggedTemplateExpression(node)
              ? node.quasi.quasis[0].value.cooked
              : '') as string,
          identifier: `Typegen${index}`,
        })).filter(({ query }) => query !== '')
        console.log(types)

       
        const typegenData = prettier.format(await getTypegenOutput(types, options), {
          ...(await prettier.resolveConfig(uri)),
          parser: 'typescript',
        })
        console.log(typegenData)
        if(await fileHasChanged()) {
          console.log('Aborting as the file has changed')
          return
        }

        await writeToTypegenFile(uri, types.length > 0 ? typegenData : '')

        // const edits = getTsTypesEdits(types)
        // if (edits.length > 0) {
        // const newFile = processFileEdits(fileContents, edits)
        // await fs.writeFile(uri, newFile)
        // }
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
