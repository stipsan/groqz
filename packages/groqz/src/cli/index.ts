/* eslint-disable @typescript-eslint/ban-ts-comment */
// Based on https://github.com/statelyai/xstate-tools/tree/main/apps/cli

import * as t from '@babel/types'
import { createIntrospectionDataset } from '@groqz/sanity'
import { type EvaluateOptions } from '@groqz/to-ts'
import { watch } from 'chokidar'
import { Command } from 'commander'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as prettier from 'prettier'

import { version } from '../../package.json'
import { extractQueriesFromFile } from './extractQueriesFromFile'
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

const program = new Command()

program.version(version)

let dataset: EvaluateOptions['dataset']

const writeToFiles = async (uriArray: string[], workspace?: string) => {
  if (!dataset) {
    dataset = await createIntrospectionDataset(workspace)
  }
  const options: EvaluateOptions = { dataset }
  /**
   * TODO - implement pretty readout
   */
  await Promise.all(
    uriArray.map(async (uri) => {
      try {
        const fileContents = await fs.readFile(uri, 'utf8')
        const fileHasChanged = async () => {
          return fileContents !== (await fs.readFile(uri, 'utf8'))
        }

        const extracted = extractQueriesFromFile(fileContents)

        if (!extracted) {
          return
        }

        const types = extracted.nodes
          .map((node, index) => ({
            node,
            query: (t.isTSAsExpression(node) &&
            t.isTaggedTemplateExpression(node.expression)
              ? node.expression.quasi.quasis[0].value.cooked
              : t.isTaggedTemplateExpression(node)
              ? node.quasi.quasis[0].value.cooked
              : '') as string,
            identifier: `Typegen${index}`,
          }))
          .filter(({ query }) => query !== '')

        const typegenData = prettier.format(
          await getTypegenOutput(types, options),
          {
            ...(await prettier.resolveConfig(uri)),
            parser: 'typescript',
          }
        )

        if (await fileHasChanged()) {
          console.log(`${uri} - aborting, file changed`)
          return
        }

        await writeToTypegenFile(uri, types.length > 0 ? typegenData : '')

        const edits = types.map(({ node, identifier }) => {
          const importType = `import('./${path.basename(
            uri.slice(0, -path.extname(uri).length) + '.typegen'
          )}').${identifier}`
          return t.isTSAsExpression(node)
            ? {
                newText: importType,
                range: [
                  node.typeAnnotation.start!,
                  node.typeAnnotation.end!,
                ] as [number, number],
              }
            : {
                newText: ` as ${importType}`,
                range: [node.end!, node.end!] as [number, number],
              }
        })

        if (edits.length > 0) {
          const newFile = processFileEdits(fileContents, edits)

          if (await fileHasChanged()) {
            console.log(`${uri} - aborting, file changed`)
            return
          }

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
  .description('Generate Zod types from GROQ queries')
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
          const settled = await Promise.allSettled(tasks)
          if (settled.some((result) => result.status === 'rejected')) {
            process.exit(1)
          }
          process.exit(0)
        })
    }
  })

program.parse(process.argv)
