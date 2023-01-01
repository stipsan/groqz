/* eslint-disable @typescript-eslint/no-explicit-any */
import { json as _json } from '@groqz/json'
import { type EvaluateOptions, introspect } from '@groqz/parser'
import { z } from 'zod'
import { withGetType } from 'zod-to-ts'

export * from '@groqz/json'

// return a TS AST node with an import to the recursive JSON type
const json: typeof _json = withGetType(_json, (ts) =>
  ts.factory.createImportTypeNode(
    ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral('groqz')),
    undefined,
    ts.factory.createIdentifier('Json'),
    undefined,
    false
  )
)

export type { EvaluateOptions }

/** @alpha */

export async function groqToZod(query: string, options?: EvaluateOptions) {
  return await introspect(query, options, (key: string, value: any) => {
    if (key === '_type' && typeof value === 'string') {
      return z.literal(value)
    }

    /**
     * If it's null then we can't infer the type and we return the general JSON type
     */
    if (value === null) {
      return key === '' || isNumber.test(key) ? json : json.optional()
    }

    if (Array.isArray(value)) {
      /**
       * If the array is empty then we can't infer the type beyond it being an array that can contain items of the general JSON type
       */
      if (value.length === 0) {
        return z.array(json)
      }
      if (value.length === 1) {
        return z.array(value[0] as any)
      }

      const canUseDiscriminatedUnion = value.every((v) => {
        if (v._def.typeName === 'ZodObject') {
          return '_type' in v._def.shape()
        }
        return false
      })
      return z.array(
        canUseDiscriminatedUnion
          ? z.discriminatedUnion('_type', value as any)
          : z.union(value as any)
      )
    }

    switch (typeof value) {
      case 'number':
        return key === '' || isNumber.test(key)
          ? z.number()
          : z.number().nullish()
      case 'string':
        return key === '' || isNumber.test(key) || key === '_id'
          ? z.string()
          : z.string().nullish()
      case 'boolean':
        return key === '' || isNumber.test(key)
          ? z.boolean()
          : z.boolean().nullish()
      case 'object':
        return key === '' || isNumber.test(key)
          ? z.object(value as any).strict()
          : z
              .object(value as any)
              .strict()
              .nullish()
    }

    throw new Error(`Unknown key ${key} with value ${value}`)
  })
}

const isNumber = /^\d+$/
