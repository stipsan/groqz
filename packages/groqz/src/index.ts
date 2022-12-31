import { json as schema } from '@groqz/json'

import type { ParsedQuery } from './types'

/** @alpha */
export function groq(
  strings: TemplateStringsArray,
  // @TODO change the typing to disallow arguments, as they're not supported
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...keys: any[]
): ParsedQuery<typeof schema> {
  const lastIndex = strings.length - 1
  const query =
    strings.slice(0, lastIndex).reduce((acc, str, i) => {
      return acc + str + keys[i]
    }, '') + strings[lastIndex]

  // @TODO console.warn about missing tooling, need to setup babel, rollup or whatever

  // Bundler tooling makes sure the runtime parser is generated at build time,
  // the logic in this function isn't intended to be used at runtime.
  return { query, schema }
}

export * from './types'
export * from '@groqz/json'
