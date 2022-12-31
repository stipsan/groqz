import { z } from 'zod'

/**
 * Recursive JSON value types.
 * Used on values that can't be inferred by groqz, or known ahead of time/compile-time
 */

/** @public */
export const literal = z.union([z.string(), z.number(), z.boolean(), z.null()])
/** @public */
export type Literal = z.infer<typeof literal>
/** @public */
export type Json = Literal | { [key: string]: Json } | Json[]
/** @public */
export const json: z.ZodType<Json> = z.lazy(() =>
  z.union([literal, z.array(json), z.record(json)])
)
