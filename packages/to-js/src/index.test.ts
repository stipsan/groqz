import groq from 'groq'
import { expect, test } from 'vitest'

import { groqToJs, printQueries } from './index'

test('groqToJs', async () => {
  expect(await groqToJs(groq`*[_type == "page"]{ _id, _type, title }`)).toBe(
    `jsonSchema
`
  )

  expect(
    await groqToJs(groq`*[_type == "page"]{ _id, _type, title }`, {
      dataset: [],
    })
  ).toBe(`z.array(jsonSchema)
`)

  expect(
    await groqToJs(groq`*[_type == "page"]{ _id, _type, title, description }`, {
      dataset: [{ _type: 'page', _id: '_id', title: 'title' }],
    })
  ).toBe(`z.array(
  z
    .object({
      _id: z.string(),
      _type: z.literal("page"),
      title: z.string().optional(),
      description: jsonSchema.optional(),
    })
    .strict()
)
`)

  expect(
    await groqToJs(groq`*[]{_type, title }`, {
      dataset: [{ _type: 'page', title: 'title' }, { _type: 'person' }],
    })
  ).toBe(`z.array(
  z.union([
    z
      .object({
        _type: z.literal("page"),
        title: z.string().optional(),
      })
      .strict(),
    z
      .object({
        _type: z.literal("person"),
        title: jsonSchema.optional(),
      })
      .strict(),
  ])
)
`)

  expect(
    await groqToJs(groq`*[]{_type }`, {
      dataset: [{ _type: 'page' }, { _type: 'person' }],
    })
  ).toBe(`z.array(
  z.union([
    z
      .object({
        _type: z.literal("page"),
      })
      .strict(),
    z
      .object({
        _type: z.literal("person"),
      })
      .strict(),
  ])
)
`)
})

test('printQueries', async () => {
  expect(
    await printQueries(
      [
        groq`*[]{_type, title }`,
        groq`*[_type == "page"]{_type, title }[0]`,
        groq`*[_type == "movie"]{
          _type, title 
        }[0]`,
      ],
      {
        dataset: [{ _type: 'page', title: 'title' }, { _type: 'person' }],
      }
    )
  ).toMatchInlineSnapshot(`
    "// This file was automatically generated. Edits will be overwritten
    import { z } from \\"zod\\"

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
      query: \\"*[]{_type, title }\\",
      schema: z.array(
        z.union([
          z
            .object({
              _type: z.literal(\\"page\\"),
              title: z.string().optional(),
            })
            .strict(),
          z
            .object({
              _type: z.literal(\\"person\\"),
              title: jsonSchema.optional(),
            })
            .strict(),
        ])
      ),
    }

    export const gen1 = {
      query: '*[_type == \\"page\\"]{_type, title }[0]',
      schema: z
        .object({
          _type: z.literal(\\"page\\"),
          title: z.string().optional(),
        })
        .strict(),
    }

    export const gen2 = {
      query: '*[_type == \\"movie\\"]{\\\\n          _type, title \\\\n        }[0]',
      schema: jsonSchema,
    }
    "
  `)
})
