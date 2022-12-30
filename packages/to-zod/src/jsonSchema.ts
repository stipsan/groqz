import { z } from 'zod'
import { withGetType } from 'zod-to-ts'

/**
 * Recursive JSON value types.
 * Used on values that can't be inferred
 */

/** @alpha */
export const literalSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
])
/** @alpha */
export type Literal = z.infer<typeof literalSchema>
/** @alpha */
export type Json = Literal | { [key: string]: Json } | Json[]
/** @alpha */
export const jsonSchema: z.ZodType<Json> = withGetType(
  z.lazy(() =>
    z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
  ),
  // return a TS AST node with an identifier for JSONValue, a predefined recursive JSON type
  (ts) => ts.factory.createIdentifier('Json')
)
