// This file was automatically generated. Edits will be overwritten
import { z } from 'zod'

export type Literal = string | number | boolean | null
export type Json = Literal | { [key: string]: Json } | Json[]

export interface gen0 {
  query: /* groq */ `*[_type == "page"]{ _id, _type, title }`
  schema: z.ZodType<
    {
      _id: string
      _type: 'page'
      title?: string | undefined
    }[]
  >
}
