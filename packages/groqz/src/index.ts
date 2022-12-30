import { parse } from 'groq-js'
import { z } from 'zod'

import type { BaseResult } from './types'

/** @alpha */
export function groq(
  strings: TemplateStringsArray,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...keys: any[]
): BaseResult<z.ZodType<unknown>> {
  const lastIndex = strings.length - 1
  const query =
    strings.slice(0, lastIndex).reduce((acc, str, i) => {
      return acc + str + keys[i]
    }, '') + strings[lastIndex]
  const schema = z.array(z.unknown())
  const ast = parse(query)

  console.log('groqz', { query, ast, schema })

  return {
    get query() {
      return query
    },
    get schema() {
      return schema
    },
  }
}

export { BaseResult,z }
export type { InferType } from './types'
