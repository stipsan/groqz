import groq from 'groq'
import prettier from 'prettier'
import { expect, test } from 'vitest'

import { groqToTs, printQueries } from './index'

function fmt(code: string) {
  return prettier.format(`type Test = ${code}`, {
    semi: false,
    parser: 'typescript',
  })
}

test('groqToTs', async () => {
  expect(await groqToTs(groq`*[_type == "page"]{ _id, _type, title }`)).toBe(
    `import("groqz").Json`
  )

  expect(
    await groqToTs(groq`*[_type == "page"]{ _id, _type, title }`, {
      dataset: [],
    })
  ).toBe(`import("groqz").Json[]`)

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
    title?: (string | undefined) | null;
    description?: import("groqz").Json | undefined;
}[]`)
  )

  expect(
    await groqToTs(groq`*[]{_type, title }`, {
      dataset: [{ _type: 'page', title: 'title' }, { _type: 'person' }],
    })
  ).toBe(`({
    _type: "page";
    title?: (string | undefined) | null;
} | {
    _type: "person";
    title?: import("groqz").Json | undefined;
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

    export interface gen0 {
      query: /* groq */ \`*[]{_type, title }\`
      schema: z.ZodType<
        (
          | {
              _type: \\"page\\"
              title?: (string | undefined) | null
            }
          | {
              _type: \\"person\\"
              title?: import(\\"groqz\\").Json | undefined
            }
        )[]
      >
    }

    export interface gen1 {
      query: /* groq */ \`*[_type == \\"page\\"]{_type, title }[0]\`
      schema: z.ZodType<{
        _type: \\"page\\"
        title?: (string | undefined) | null
      }>
    }

    export interface gen2 {
      query: /* groq */ \`*[_type == \\"movie\\"]{
              _type, title 
            }[0]\`
      schema: z.ZodType<import(\\"groqz\\").Json>
    }
    "
  `)
})
