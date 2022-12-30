import groq from 'groq'
import { expect, it } from 'vitest'

import { groqToTs } from './index'

it('creates valid type definitions', async () => {
  expect(await groqToTs(groq`*[_type == "page"]{ _id, _type, title }`)).toBe(
    `Json`
  )

  expect(
    await groqToTs(groq`*[_type == "page"]{ _id, _type, title }`, {
      dataset: [],
    })
  ).toBe(`Json[]`)

  expect(
    await groqToTs(groq`*[_type == "page"]{ _id, _type, title, description }`, {
      dataset: [{ _type: 'page', _id: '_id', title: 'title' }],
    })
  ).toBe(`{
    _id: string;
    _type: "page";
    title?: string | undefined;
    description?: Json | undefined;
}[]`)

  expect(
    await groqToTs(groq`*[]{_type, title }`, {
      dataset: [{ _type: 'page', title: 'title' }, { _type: 'person' }],
    })
  ).toBe(`{
  _id: string;
  _type: "page";
  title?: string | undefined;
  description?: Json | undefined;
}[]`)
})
