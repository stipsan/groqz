// This file was automatically generated. Edits will be overwritten
import { z } from 'zod'

export interface gen0 {
  query: /* groq */ `*`
  schema: z.ZodType<
    (
      | {
          _type: 'page'
          _id: string
          title?: string | undefined
          category?:
            | {
                _ref?: string | undefined
                _type: 'reference'
              }
            | undefined
        }
      | {
          _type: 'category'
          _id: string
          title?: string | undefined
        }
    )[]
  >
}

export interface gen1 {
  query: /* groq */ `*[_type == "page"]{ ..., category-> }[0]`
  schema: z.ZodType<{
    _type: 'page'
    _id: string
    title?: string | undefined
    category?:
      | {
          _type: 'category'
          _id: string
          title?: string | undefined
        }
      | undefined
  }>
}

export interface gen2 {
  query: /* groq */ `*[_type == "movie"]`
  schema: z.ZodType<import('groqz').Json[]>
}
