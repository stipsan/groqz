// This file was automatically generated. Edits will be overwritten
import { z } from 'zod'

export interface gen0 {
  query: /* groq */ `*`
  schema: z.ZodType<
    (
      | {
          _type: 'page'
          _id: string
          title?: (string | undefined) | null
          category?:
            | (
                | {
                    _ref?: (string | undefined) | null
                    _type: 'reference'
                  }
                | undefined
              )
            | null
        }
      | {
          _type: 'category'
          _id: string
          title?: (string | undefined) | null
        }
    )[]
  >
}

export interface gen1 {
  query: /* groq */ `*[_type == "page"]{ ..., category-> }[0]`
  schema: z.ZodType<{
    _type: 'page'
    _id: string
    title?: (string | undefined) | null
    category?:
      | (
          | {
              _type: 'category'
              _id: string
              title?: (string | undefined) | null
            }
          | undefined
        )
      | null
  }>
}

export interface gen2 {
  query: /* groq */ `*[_type == "movie"]`
  schema: z.ZodType<import('groqz').Json[]>
}
