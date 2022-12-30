import { type EvaluateOptions, introspect } from '@groqz/parser'
import prettier from 'prettier'

export type { EvaluateOptions }

// @TODO move this to @groqz/parser
const guaranteedKeys = new Set([
  '_createdAt',
  '_id',
  '_rev',
  '_type',
  '_updatedAt',
])

/** @alpha */
export async function groqToJs(query: string, options?: EvaluateOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await introspect(query, options, (key: string, value: any) => {
    if (key === '_type' && typeof value === 'string') {
      return `z.literal(${JSON.stringify(value)})`
    }

    /**
     * If it's null then we can't infer the type and we return the general JSON type
     */
    if (value === null) {
      return key === '' ? `jsonSchema` : `jsonSchema.optional()`
    }

    if (Array.isArray(value)) {
      /**
       * If the array is empty then we can't infer the type beyond it being an array that can contain items of the general JSON type
       */
      if (value.length === 0) {
        return `z.array(jsonSchema)`
      }
      if (value.length === 1) {
        return `z.array(${value[0]})`
      }
      return `z.array(z.union([${value.join(',')}]))`
    }

    switch (typeof value) {
      case 'number':
        return key === '' ? `z.number()` : `z.number().optional()`
      case 'string':
        return guaranteedKeys.has(key) ? `z.string()` : `z.string().optional()`
      case 'boolean':
        return key === '' ? `z.boolean()` : `z.boolean().optional()`
      case 'object':
        return `z.object(${stringifyObject(value)}).strict()`
    }

    throw new Error(`Unknown key ${key} with value ${value}`)
  })
  return prettier.format(result, { semi: false, parser: 'babel' })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stringifyObject(obj: any): string {
  const parts = []
  for (const key in obj) {
    parts.push(`${JSON.stringify(key)}: ${obj[key]}`)
  }
  return `{
    ${parts.join(`,
`)}
}`
}

/** @alpha */
export async function printQueries(
  queries: string[],
  options?: EvaluateOptions
) {
  const typedefs: string[] = []
  for (const query of queries) {
    const identifier = `gen${typedefs.length}`
    typedefs.push(`export const ${identifier} = {
  query: ${JSON.stringify(`${query}`)},
  schema: ${await groqToJs(query, options)}
}`)
  }

  const result = `// This file was automatically generated. Edits will be overwritten
  import {z} from "zod";
  
  export const literalSchema = z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
  ])
  export const jsonSchema = z.lazy(() =>
    z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
  )
  
  ${typedefs.join(`
  
  `)}
  `
  return prettier.format(result, { semi: false, parser: 'babel' })
}
