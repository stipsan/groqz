import groq from 'groq'
import { expect, test } from 'vitest'

import { groqToJs, printQueries } from './index'

test('groqToJs', async () => {
  expect(await groqToJs(groq`*[_type == "page"]{ _id, _type, title }`)).toBe(
    `json`
  )

  expect(
    await groqToJs(groq`*[_type == "page"]{ _id, _type, title }`, {
      dataset: [],
    })
  ).toBe(`z.array(json)`)

  expect(
    await groqToJs(groq`*[_type == "page"]{ _id, _type, title, description }`, {
      dataset: [{ _type: 'page', _id: '_id', title: 'title' }],
    })
  ).toMatchInlineSnapshot(`
    "z.array(z.object({
        \\"_id\\": z.string(),
    \\"_type\\": z.literal(\\"page\\"),
    \\"title\\": z.string().nullish(),
    \\"description\\": json.optional()
    }).strict())"
  `)

  expect(
    await groqToJs(groq`*[]{_type, title }`, {
      dataset: [{ _type: 'page', title: 'title' }, { _type: 'person' }],
    })
  ).toMatchInlineSnapshot(`
    "z.array(z.discriminatedUnion(\\"_type\\", [z.object({
        \\"_type\\": z.literal(\\"page\\"),
    \\"title\\": z.string().nullish()
    }).strict(),z.object({
        \\"_type\\": z.literal(\\"person\\"),
    \\"title\\": json.optional()
    }).strict()]))"
  `)

  expect(
    await groqToJs(groq`*[]{_type }`, {
      dataset: [{ _type: 'page' }, { _type: 'person' }],
    })
  ).toMatchInlineSnapshot(`
    "z.array(z.discriminatedUnion(\\"_type\\", [z.object({
        \\"_type\\": z.literal(\\"page\\")
    }).strict(),z.object({
        \\"_type\\": z.literal(\\"person\\")
    }).strict()]))"
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
    import { json } from \\"groqz\\"
    import { z } from \\"zod\\"

    export const gen0 = {
      query: \\"*[]{_type, title }\\",
      schema: z.array(
        z.discriminatedUnion(\\"_type\\", [
          z
            .object({
              _type: z.literal(\\"page\\"),
              title: z.string().nullish(),
            })
            .strict(),
          z
            .object({
              _type: z.literal(\\"person\\"),
              title: json.optional(),
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
          title: z.string().nullish(),
        })
        .strict(),
    }

    export const gen2 = {
      query: '*[_type == \\"movie\\"]{\\\\n          _type, title \\\\n        }[0]',
      schema: json,
    }
    "
  `)
})
