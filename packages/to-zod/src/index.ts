import { z } from 'zod'
import { parse } from './parse'

/** @alpha */
export function groqToZod(query: string): z.ZodType<unknown> {
  const ast = parse(query)

  console.log('groqToZod', { query, ast })

  return z.unknown()
}

/**
 * Used for tooling that generate source code from a query
 * @alpha
 */
export function printZodFromGroq(query: string): string {
  const ast = parse(query)

  console.log('printZodFromGroq', { query, ast })

  return `z.unknown()`
}

export { z }
