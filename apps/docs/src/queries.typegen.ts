// This file was automatically generated. Edits will be overwritten
import { z } from 'zod'

export interface gen0 {
  query: /* groq */ `*[_type == "page"]{ _id, _type, title, description }`
  schema: z.ZodType<
    {
      _id: string
      _type: 'page'
      title?: (string | undefined) | null
      description?: import('groqz').Json | undefined
    }[]
  >
}
