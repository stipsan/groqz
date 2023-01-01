/**
 * @alpha
 */

import { getGraphQLAPIs } from './getGraphQLAPIs'

export async function createIntrospectionDataset(workspace?: string) {
  const config = await getGraphQLAPIs({
    workspace,
    workDir: process.cwd(),
  })
  return config.introspectionDataset
}
