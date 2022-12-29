import { z } from 'zod'
import { parse } from './parse'

/** @alpha */
export function groqToZod(query: string): z.ZodType<unknown> {
  const ast = parse(query)

  console.log('groqToZod', { query, ast })

  return z.unknown()
}

export { z }
