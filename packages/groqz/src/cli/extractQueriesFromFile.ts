import { ALLOWED_IMPORT_SPECIFIER_SOURCE } from './constants'
import { getQueryNodesFromFile } from './getQueryNodesFromFile'
import { FileExtractResult } from './types'

export const extractQueriesFromFile = (
  fileContent: string
): FileExtractResult | null => {
  if (!fileContent.includes(ALLOWED_IMPORT_SPECIFIER_SOURCE)) {
    return null
  }

  return getQueryNodesFromFile(fileContent)
}
