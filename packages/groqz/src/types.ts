import { z } from 'zod'

/** @alpha */
export type ParsedQuery<T> = {
  query: string
  schema: T
}

/**
 * Based on https://github.com/FormidableLabs/groqd/blob/c36a0140230e50ecc58ce466e5ab9f9069476b27/src/types.ts
 * @alpha
 */
export type InferType<Result> = Result extends ParsedQuery<infer T>
  ? T extends z.ZodType
    ? z.infer<T>
    : never
  : never
