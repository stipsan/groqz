// This file was automatically generated. Edits will be overwritten
import { z } from 'zod'
import { json } from 'groqz'

export const gen0 = {
  query: /* groq */ `*[_type == "page"]{ _id, _type, title, description }`,
  schema: z.array(
    z
      .object({
        _id: z.string(),
        _type: z.literal('page'),
        title: z.string().optional(),
        description: json.optional(),
      })
      .strict()
  ),
}
