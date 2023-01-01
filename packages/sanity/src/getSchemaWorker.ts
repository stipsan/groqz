/**
 * Lifted from https://github.com/sanity-io/sanity/blob/d7145405506388e86f2e122e3bdf686f9cbde997/packages/sanity/src/_internal/cli/threads/getGraphQLAPIs.ts
 */

import type { Json } from '@groqz/json'
import type { CliV3CommandContext } from '@sanity/cli'
import oneline from 'oneline'
import { Workspace } from 'sanity'
import {
  isMainThread,
  MessagePort,
  parentPort,
  workerData,
} from 'worker_threads'

import { extractFromSanitySchema } from './extractFromSanitySchema'
import { getStudioConfig } from './getStudioConfig'

if (isMainThread || !parentPort) {
  throw new Error('This module must be run as a worker thread')
}

getSchemaForked(parentPort)

async function getSchemaForked(parent: MessagePort): Promise<void> {
  const { workDir, workspace } = workerData
  const resolved = await resolveStudioSchema({ workDir, workspace })
  parent.postMessage(resolved)
}

async function resolveStudioSchema({
  workDir,
  workspace,
}: Pick<CliV3CommandContext, 'workDir'> & {
  workspace?: string
}): Promise<{
  projectId: string
  dataset: string
  introspectionDataset: Json[]
}> {
  const workspaces = await getStudioConfig({ basePath: workDir })
  const numSources = workspaces.reduce(
    (count, workspace) => count + workspace.unstable_sources.length,
    0
  )
  const multiSource = numSources > 1
  const multiWorkspace = workspaces.length > 1

  if (workspaces.length === 0) {
    throw new Error('No studio configuration found')
  }

  if (numSources === 0) {
    throw new Error('No sources (project ID / dataset) configured')
  }

  // We can only automatically configure if there is a single workspace + source in play
  if ((multiWorkspace || multiSource) && !workspace) {
    throw new Error(oneline`
      Multiple workspaces/sources configured.
      You must define the name of the workspace you wish to introspect.
    `)
  }

  // No config is defined, but we have a single workspace + source, so use that
  if (!workspace) {
    const { projectId, dataset, schema } = workspaces[0].unstable_sources[0]
    return {
      introspectionDataset: await extractFromSanitySchema(schema),
      projectId,
      dataset,
    }
  }

  // Explicity defined config
  return resolveSchemaFromConfig(workspaces, workspace)
}

async function resolveSchemaFromConfig(
  workspaces: Workspace[],
  workspaceName: string
): Promise<{
  projectId: string
  dataset: string
  introspectionDataset: Json[]
}> {
  if (!workspaceName && workspaces.length > 1) {
    throw new Error(
      'Must define `workspace` name when multiple workspaces are defined'
    )
  }

  // If we only have a single workspace defined, we can assume that is the intended one,
  // even if no `workspace` is defined for the GraphQL API
  const workspace =
    !workspaceName && workspaces.length === 1
      ? workspaces[0]
      : workspaces.find((space) => space.name === (workspaceName || 'default'))

  if (!workspace) {
    throw new Error(`Workspace "${workspaceName || 'default'}" not found`)
  }

  // @TODO investigate if `sourceName` is needed
  let sourceName: string | undefined

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

  return {
    dataset: source.dataset,
    projectId: source.projectId,
    introspectionDataset: await extractFromSanitySchema(source.schema),
  }
}
