import { type EvaluateOptions, groqToZod } from '@groqz/to-zod'
import { printNode, zodToTs } from 'zod-to-ts'

export type { EvaluateOptions }

/** @alpha */
export async function groqToTs(query: string, options?: EvaluateOptions) {
  const schema = await groqToZod(query, options)
  const { node } = zodToTs(schema)
  return printNode(node)
}

/** @alpha */
export async function printQueries(
  queries: string[],
  options?: EvaluateOptions
) {
  const typedefs: string[] = []
  for (const query of queries) {
    const identifier = `gen${typedefs.length}`
    typedefs.push(`export interface ${identifier} {
  query: /* groq */ \`${JSON.parse(JSON.stringify(`${query}`))}\`
  schema: z.ZodType<${await groqToTs(query, options)}>
}`)
  }

  return `// This file was automatically generated. Edits will be overwritten
import {z} from "zod";

export type Literal = string | number | boolean | null
export type Json = Literal | { [key: string]: Json } | Json[]

${typedefs.join(`

`)}
`
}
