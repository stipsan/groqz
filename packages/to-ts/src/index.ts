import { groqToZod } from '@groqz/to-zod'
import { zodToTs, printNode } from 'zod-to-ts'

/** @alpha */
export function groqToTs(query: string) {
  const schema = groqToZod(query)
  const { node } = zodToTs(schema)
  return printNode(node)
}
