import type { StrictUnknownQueryResponseResult } from '@sanity/client'
import { z } from 'zod'

export type { StrictUnknownQueryResponseResult }

/**
 * Recursive JSON value types.
 * Used on values that can't be inferred by groqz, or known ahead of time/compile-time
 */

/** @public */
export type Json = StrictUnknownQueryResponseResult
/** @public */
export const literal = z.union([z.string(), z.number(), z.boolean(), z.null()])
/** @public */
export const json: z.ZodType<Json> = z.lazy(() =>
  z.union([literal, z.array(json), z.record(json)])
)
