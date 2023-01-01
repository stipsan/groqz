// This file was automatically generated. Edits will be overwritten
import { json } from 'groqz'
import { z } from 'zod'

export const gen0 = {
  query: '*[_type in ["category", "page"]]{..., category->{title}}',
  schema: z.array(
    z.discriminatedUnion('_type', [
      z
        .object({
          title: z.string().nullish(),
          category: z
            .object({
              title: z.string().nullish(),
            })
            .strict()
            .nullish(),
          _type: z.literal('page'),
          _id: z.string(),
          _rev: z.string().nullish(),
          _createdAt: z.string().nullish(),
          _updatedAt: z.string().nullish(),
        })
        .strict(),
      z
        .object({
          title: z.string().nullish(),
          image: z
            .object({
              _type: z.literal('image'),
              asset: z
                .object({
                  _ref: z.string().nullish(),
                  _type: z.literal('reference'),
                })
                .strict()
                .nullish(),
            })
            .strict()
            .nullish(),
          _type: z.literal('category'),
          _id: z.string(),
          _rev: z.string().nullish(),
          _createdAt: z.string().nullish(),
          _updatedAt: z.string().nullish(),
          category: json.optional(),
        })
        .strict(),
    ])
  ),
}

export const gen1 = {
  query:
    '*[_type == "category"]{title, _type, "image": image.asset->{url, size}}[0]',
  schema: z
    .object({
      title: z.string().nullish(),
      _type: z.literal('category'),
      image: z
        .object({
          url: z.string().nullish(),
          size: z.number().nullish(),
        })
        .strict()
        .nullish(),
    })
    .strict(),
}

export const gen2 = {
  query: '*[_type == "movie"]',
  schema: z.array(json),
}
