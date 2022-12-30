import groq from 'groq'
import prettier from 'prettier'
import { expect, test } from 'vitest'

import { groqToTs, printQueries } from './index'

function fmt(code: string) {
  return prettier
    .format(`type Test = ${code}`, {
      semi: false,
      parser: 'typescript',
    })
    .replaceAll('\r\n', '\n')
}

test('groqToTs', async () => {
  expect(await groqToTs(groq`*[_type == "page"]{ _id, _type, title }`)).toBe(
    `Json`
  )

  expect(
    await groqToTs(groq`*[_type == "page"]{ _id, _type, title }`, {
      dataset: [],
    })
  ).toBe(`Json[]`)

  expect(
    fmt(
      await groqToTs(
        groq`*[_type == "page"]{ _id, _type, title, description }`,
        {
          dataset: [{ _type: 'page', _id: '_id', title: 'title' }],
        }
      )
    )
  ).toBe(
    fmt(`{
    _id: string;
    _type: "page";
    title?: string | undefined;
    description?: Json | undefined;
}[]`)
  )

  expect(
    await groqToTs(groq`*[]{_type, title }`, {
      dataset: [{ _type: 'page', title: 'title' }, { _type: 'person' }],
    })
  ).toBe(`({
    _type: "page";
    title?: string | undefined;
} | {
    _type: "person";
    title?: Json | undefined;
})[]`)

  expect(
    await groqToTs(groq`*[]{_type }`, {
      dataset: [{ _type: 'page' }, { _type: 'person' }],
    })
  ).toBe(`({
    _type: "page";
} | {
    _type: "person";
})[]`)
})

test('printQueries', async () => {
  expect(
    prettier.format(
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
      ),
      { semi: false, parser: 'typescript' }
    )
  ).toMatchInlineSnapshot(`
    "// This file was automatically generated. Edits will be overwritten
    import { z } from \\"zod\\"

    export type Literal = string | number | boolean | null
    export type Json = Literal | { [key: string]: Json } | Json[]

    export interface gen0 {
      query: /* groq */ \`*[]{_type, title }\`
      schema: z.ZodType<
        (
          | {
              _type: \\"page\\"
              title?: string | undefined
            }
          | {
              _type: \\"person\\"
              title?: Json | undefined
            }
        )[]
      >
    }

    export interface gen1 {
      query: /* groq */ \`*[_type == \\"page\\"]{_type, title }[0]\`
      schema: z.ZodType<{
        _type: \\"page\\"
        title?: string | undefined
      }>
    }

    export interface gen2 {
      query: /* groq */ \`*[_type == \\"movie\\"]{
              _type, title 
            }[0]\`
      schema: z.ZodType<Json>
    }
    "
  `)
})
