/**
 * @alpha
 */

import { extractFromSanitySchema } from './extractFromSanitySchema'
import { getGraphQLAPIs } from './getGraphQLAPIs'

export async function createIntrospectionDataset(workspace?: string) {
  const apis = await getGraphQLAPIs({
    sanityMajorVersion: 3,
    cliConfig: workspace
      ? {
          graphql: [{ workspace }],
        }
      : {},
    workDir: process.cwd(),
  } as any)
  return await extractFromSanitySchema(apis[0].schema)
}
