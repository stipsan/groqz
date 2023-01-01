import * as fs from 'fs/promises'
import * as path from 'path'

import { removeFile } from './removeFile'

export const writeToTypegenFile = async (
  filePath: string,
  fileContents: string
) => {
  const pathToSave =
    filePath.slice(0, -path.extname(filePath).length) + '.typegen.ts'

  if (!fileContents) {
    await removeFile(pathToSave)
    return
  }

  await fs.writeFile(pathToSave, fileContents)
}
