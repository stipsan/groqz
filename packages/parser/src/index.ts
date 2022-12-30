import { type EvaluateOptions, evaluate } from 'groq-js'

import { parse } from './parse'

export type { EvaluateOptions }

/** @alpha */
export async function introspect(
  query: string,
  options?: EvaluateOptions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replacer?: (key: string, value: any) => any
) {
  const ast = parse(query)
  const result = await evaluate(ast, options)
  const data = await result.get()

  if (replacer) {
    return JSON.parse(JSON.stringify(data), replacer)
  }

  return data
}
