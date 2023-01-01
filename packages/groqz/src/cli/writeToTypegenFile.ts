import { type EvaluateOptions } from '@groqz/to-ts'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as prettier from 'prettier'

import { getTypegenOutput } from './getTypegenOutput'
import { removeFile } from './removeFile'

export const writeToTypegenFile = async (
  filePath: string,
  queries: string[],
  options: EvaluateOptions
) => {
  const pathToSave =
    filePath.slice(0, -path.extname(filePath).length) + '.typegen.ts'

  if (!queries.length) {
    await removeFile(pathToSave)
    return
  }

  await fs.writeFile(
    pathToSave,
    prettier.format(await getTypegenOutput(queries, options), {
      ...(await prettier.resolveConfig(filePath)),
      parser: 'typescript',
    })
  )
}
