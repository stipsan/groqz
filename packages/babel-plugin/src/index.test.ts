/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect, test } from 'vitest'
import generate from '@babel/generator'
import { parse } from '@babel/parser'

import plugin from './index'

test('simple', async () => {
  const code = 'groq`*[_type == "page"]`'
  const ast = parse(code, { plugins: ['foobarbarbar'] })

  expect(generate(ast).code).toMatchInlineSnapshot(
    '"groq`*[_type == \\"page\\"]`;"'
  )
})
