// This file was automatically generated. Edits will be overwritten

import type { ZodSchema } from 'zod'

export interface gen0 {
  query: /* groq */ `*[_type == "page"]{ _id, _type, title }`
  schema: ZodSchema<{ _id: string; _type: 'page'; title?: string }[]>
}
