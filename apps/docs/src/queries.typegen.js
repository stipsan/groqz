// This file was automatically generated. Edits will be overwritten
import { z } from 'zod'

export const literalSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
])
export const jsonSchema = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
)

export const gen0 = {
  query: '*[_type == "page"]{ _id, _type, title }',
  schema: z.array(
    z
      .object({
        _id: z.string(),
        _type: z.literal('page'),
        title: z.string().optional(),
      })
      .strict()
  ),
}
