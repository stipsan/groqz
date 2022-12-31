// This file was automatically generated. Edits will be overwritten
import { json } from 'groqz'
import { z } from 'zod'

export const gen0 = {
  query: '*',
  schema: z.array(
    z.union([
      z
        .object({
          _type: z.literal('page'),
          _id: z.string(),
          title: z.string().optional(),
          category: z
            .object({
              _ref: z.string().optional(),
              _type: z.literal('reference'),
            })
            .strict()
            .optional(),
        })
        .strict(),
      z
        .object({
          _type: z.literal('category'),
          _id: z.string(),
          title: z.string().optional(),
        })
        .strict(),
    ])
  ),
}

export const gen1 = {
  query: '*[_type == "page"]{ ..., category-> }[0]',
  schema: z
    .object({
      _type: z.literal('page'),
      _id: z.string(),
      title: z.string().optional(),
      category: z
        .object({
          _type: z.literal('category'),
          _id: z.string(),
          title: z.string().optional(),
        })
        .strict()
        .optional(),
    })
    .strict(),
}

export const gen2 = {
  query: '*[_type == "movie"]',
  schema: z.array(json),
}
