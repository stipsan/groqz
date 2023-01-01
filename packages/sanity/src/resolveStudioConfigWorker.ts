import {
  isMainThread,
  parentPort,
  workerData,
  MessagePort,
} from 'worker_threads'
import type { CliV3CommandContext, GraphQLAPIConfig } from '@sanity/cli'
import type { Workspace } from 'sanity'
import oneline from 'oneline'

if (isMainThread || !parentPort) {
  throw new Error('This module must be run as a worker thread')
}

resolveStudioConfigForked(parentPort)

async function resolveStudioConfigForked(parent: MessagePort): Promise<void> {
  const { cliConfig, cliConfigPath, workDir } = workerData
  const resolved = await resolveStudioConfig({
    cliConfig,
    cliConfigPath,
    workDir,
  })
  parent.postMessage(resolved)
}

/**
 * Resolves the stuio config the same way as the graphql deploy command does
 * https://github.com/sanity-io/sanity/blob/d7145405506388e86f2e122e3bdf686f9cbde997/packages/sanity/src/_internal/cli/threads/getGraphQLAPIs.ts#L22
 */
async function resolveStudioConfig({
  cliConfig,
  cliConfigPath,
  workDir,
}: Pick<
  CliV3CommandContext,
  'cliConfig' | 'cliConfigPath' | 'workDir'
>): Promise<TypeResolvedGraphQLAPI[]> {
  const workspaces = await getStudioConfig({ basePath: workDir })
  const numSources = workspaces.reduce(
    (count, workspace) => count + workspace.unstable_sources.length,
    0
  )
  const multiSource = numSources > 1
  const multiWorkspace = workspaces.length > 1
  const hasGraphQLConfig = Boolean(cliConfig?.graphql)

  if (workspaces.length === 0) {
    throw new Error('No studio configuration found')
  }

  if (numSources === 0) {
    throw new Error('No sources (project ID / dataset) configured')
  }

  // We can only automatically configure if there is a single workspace + source in play
  if ((multiWorkspace || multiSource) && !hasGraphQLConfig) {
    throw new Error(oneline`
      Multiple workspaces/sources configured.
      You must define an array of GraphQL APIs in ${
        cliConfigPath || 'sanity.cli.js'
      }
      and specify which workspace/source to use.
    `)
  }

  // No config is defined, but we have a single workspace + source, so use that
  if (!hasGraphQLConfig) {
    const { projectId, dataset, schema } = workspaces[0].unstable_sources[0]
    return [{ schemaTypes: getStrippedSchemaTypes(schema), projectId, dataset }]
  }

  // Explicity defined config
  const apiDefs = validateCliConfig(cliConfig?.graphql || [])
  return resolveGraphQLAPIsFromConfig(apiDefs, workspaces)
}

function validateCliConfig(
  config: GraphQLAPIConfig[],
  configPath = 'sanity.cli.js'
): GraphQLAPIConfig[] {
  if (!Array.isArray(config)) {
    throw new Error(
      `"graphql" key in "${configPath}" must be an array if defined`
    )
  }

  if (config.length === 0) {
    throw new Error(`No GraphQL APIs defined in "${configPath}"`)
  }

  return config
}

function resolveGraphQLAPIsFromConfig(
  apiDefs: GraphQLAPIConfig[],
  workspaces: Workspace[]
): TypeResolvedGraphQLAPI[] {
  const resolvedApis: TypeResolvedGraphQLAPI[] = []

  for (const apiDef of apiDefs) {
    const { workspace: workspaceName, source: sourceName } = apiDef
    if (!workspaceName && workspaces.length > 1) {
      throw new Error(
        'Must define `workspace` name in GraphQL API config when multiple workspaces are defined'
      )
    }

    // If we only have a single workspace defined, we can assume that is the intended one,
    // even if no `workspace` is defined for the GraphQL API
    const workspace =
      !workspaceName && workspaces.length === 1
        ? workspaces[0]
        : workspaces.find(
            (space) => space.name === (workspaceName || 'default')
          )

    if (!workspace) {
      throw new Error(`Workspace "${workspaceName || 'default'}" not found`)
    }

    // If we only have a single source defined, we can assume that is the intended one,
    // even if no `source` is defined for the GraphQL API
    const source =
      !sourceName && workspace.unstable_sources.length === 1
        ? workspace.unstable_sources[0]
        : workspace.unstable_sources.find(
            (src) => src.name === (sourceName || 'default')
          )

    if (!source) {
      throw new Error(
        `Source "${sourceName || 'default'}" not found in workspace "${
          workspaceName || 'default'
        }"`
      )
    }

    resolvedApis.push({
      ...apiDef,
      dataset: source.dataset,
      projectId: source.projectId,
      schemaTypes: getStrippedSchemaTypes(source.schema),
    })
  }

  return resolvedApis
}
