import { parse as _parse } from 'groq-js'

/**
 * Takes a string, parses it with groq-js and returns a compact AST ready for conversion to Zod
 * @alpha
 */
export function parse(query: string) {
  const ast = _parse(query)

  console.log('parse', { query, ast })

  return ast
}
