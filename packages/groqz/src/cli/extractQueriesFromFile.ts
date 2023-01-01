import { getQueryNodesFromFile } from './getMachineNodesFromFile'
import { ALLOWED_IMPORT_SPECIFIER_SOURCE } from './machineCallExpression'
import { FileExtractResult } from './types'

export const extractQueriesFromFile = (
  fileContent: string
): FileExtractResult | null => {
  if (!fileContent.includes(ALLOWED_IMPORT_SPECIFIER_SOURCE)) {
    return null
  }

  return getQueryNodesFromFile(fileContent)
}
