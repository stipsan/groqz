import { type EvaluateOptions, groqToZod } from '@groqz/to-zod'
import { printNode, zodToTs } from 'zod-to-ts'

/** @alpha */
export async function groqToTs(query: string, options?: EvaluateOptions) {
  const schema = await groqToZod(query, options)
  const { node } = zodToTs(schema)
  return printNode(node)
}
