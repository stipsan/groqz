/**
 * Lifted from https://github.com/sanity-io/sanity/blob/d7145405506388e86f2e122e3bdf686f9cbde997/packages/sanity/src/_internal/cli/util/getStudioConfig.ts
 */

import fs from 'fs'
import path from 'path'
import { first } from 'rxjs/operators'
import { Config, resolveConfig, Workspace } from 'sanity'

import { mockBrowserEnvironment } from './mockBrowserEnvironment'

const candidates = [
  'sanity.config.js',
  'sanity.config.jsx',
  'sanity.config.ts',
  'sanity.config.tsx',
]

/**
 * Note: Don't run this on the main thread, use it a forked process
 */
export async function getStudioConfig(options: {
  configPath?: string
  basePath: string
}): Promise<Workspace[]> {
  let workspaces: Workspace[] | undefined

  const { basePath, configPath: cfgPath } = options

  let cleanup
  try {
    cleanup = mockBrowserEnvironment(basePath)

    let configPath = cfgPath
    if (configPath && !fs.existsSync(configPath)) {
      throw new Error(`Failed to find config at "${cfgPath}"`)
    } else if (!configPath) {
      configPath = candidates
        .map((candidate) => path.join(basePath, candidate))
        .find((candidate) => fs.existsSync(candidate))
    }

    if (!configPath) {
      throw new Error(
        `Failed to resolve sanity.config.(js|ts) for base path "${basePath}"`
      )
    }

    let config: Config | undefined
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(configPath)
      config = mod.__esModule && mod.default ? mod.default : mod
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(
        `Failed to load configuration file "${configPath}":\n${err.message}`
      )
    }

    if (!config) {
      throw new Error('Configuration did not export expected config shape')
    }

    workspaces = await resolveConfig(config).pipe(first()).toPromise()
  } catch (error) {
    if (cleanup) {
      cleanup()
    }

    throw error
  }

  cleanup()

  if (!workspaces) {
    throw new Error('Failed to resolve configuration')
  }

  return workspaces
}
