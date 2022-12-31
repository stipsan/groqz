import { type EvaluateOptions, introspect } from '@groqz/parser'
import prettier from 'prettier'

export type { EvaluateOptions }

/** @alpha */
export interface IntrospectOptions extends EvaluateOptions {
  /**
   * @defaultValue 'json'
   */
  jsonSchemaIdentifier?: string
}

// @TODO move this to @groqz/parser
const guaranteedKeys = new Set([
  '_createdAt',
  '_id',
  '_rev',
  '_type',
  '_updatedAt',
])

/** @alpha */
export async function groqToJs(
  query: string,
  { jsonSchemaIdentifier = 'json', ...options }: IntrospectOptions = {}
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await introspect(query, options, (key: string, value: any) => {
    if (key === '_type' && typeof value === 'string') {
      return `z.literal(${JSON.stringify(value)})`
    }

    /**
     * If it's null then we can't infer the type and we return the general JSON type
     */
    if (value === null) {
      return key === '' || isNumber.test(key)
        ? jsonSchemaIdentifier
        : `${jsonSchemaIdentifier}.optional()`
    }

    if (Array.isArray(value)) {
      /**
       * If the array is empty then we can't infer the type beyond it being an array that can contain items of the general JSON type
       */
      if (value.length === 0) {
        return `z.array(${jsonSchemaIdentifier})`
      }
      if (value.length === 1) {
        return `z.array(${value[0]})`
      }

      const canUseDiscriminatedUnion = value.every((v) => {
        return (v as string).includes(`    "_type": z.literal`)
      })
      return canUseDiscriminatedUnion
        ? `z.array(z.discriminatedUnion("_type", [${value.join(',')}]))`
        : `z.array(z.union([${value.join(',')}]))`
    }

    switch (typeof value) {
      case 'number':
        return key === '' || isNumber.test(key)
          ? `z.number()`
          : `z.number().nullish()`
      case 'string':
        return key === '' || isNumber.test(key) || guaranteedKeys.has(key)
          ? `z.string()`
          : `z.string().nullish()`
      case 'boolean':
        return key === '' || isNumber.test(key)
          ? `z.boolean()`
          : `z.boolean().nullish()`
      case 'object':
        return key === '' || isNumber.test(key)
          ? `z.object(${stringifyObject(value)}).strict()`
          : `z.object(${stringifyObject(value)}).strict().nullish()`
    }

    throw new Error(`Unknown key ${key} with value ${value}`)
  })
  return result
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

const isNumber = /^\d+$/

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
  import {json} from "groqz";
  import {z} from "zod";
  
  ${typedefs.join(`
  
  `)}
  `
  return prettier.format(result, { semi: false, parser: 'babel' })
}
