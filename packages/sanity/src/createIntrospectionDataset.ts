/**
 * @alpha
 */

import { getSchema } from './getSchema'

export async function createIntrospectionDataset(workspace?: string) {
  const config = await getSchema({
    workspace,
    workDir: process.cwd(),
  })
  return config.introspectionDataset
}
