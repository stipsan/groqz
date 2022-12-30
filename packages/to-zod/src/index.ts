import { type EvaluateOptions, evaluate } from 'groq-js'
import { z } from 'zod'

import { jsonSchema } from './jsonSchema'
import { parse } from './parse'

export * from './jsonSchema'

const guaranteedKeys = new Set([
  '_createdAt',
  '_id',
  '_rev',
  '_type',
  '_updatedAt',
])

export type { EvaluateOptions }

/** @alpha */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function groqToZod(query: string, options?: EvaluateOptions) {
  const ast = parse(query)
  const result = await evaluate(ast, options)

  return JSON.parse(
    JSON.stringify(await result.get()),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (key: string, value: any) => {
      if (key === '_type' && typeof value === 'string') {
        return z.literal(value)
      }

      /**
       * If it's null then we can't infer the type and we return the general JSON type
       */
      if (value === null) {
        return key === '' ? jsonSchema : jsonSchema.optional()
      }

      if (Array.isArray(value)) {
        /**
         * If the array is empty then we can't infer the type beyond it being an array that can contain items of the general JSON type
         */
        if (value.length === 0) {
          return z.array(jsonSchema)
        }
        if (value.length === 1) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return z.array(value[0] as any)
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return z.array(z.union(value as any))
      }

      switch (typeof value) {
        case 'number':
          return key === '' ? z.number() : z.number().optional()
        case 'string':
          return guaranteedKeys.has(key) ? z.string() : z.string().optional()
        case 'boolean':
          return key === '' ? z.boolean() : z.boolean().optional()
        case 'object':
          return key === ''
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              z.object(value as any).strict()
            : z
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .object(value as any)
                .strict()
      }

      throw new Error(`Unknown key ${key} with value ${value}`)
    }
  )
}

export { z }
