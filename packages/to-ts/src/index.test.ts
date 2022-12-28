import { describe, it, expect } from 'vitest'

import { groqToTs } from './index'

describe.concurrent('groqToTs', () => {
  it('creates valid type definitions', () => {
    expect(groqToTs(`*[_type == "page"]{ _id, _type, title }`)).toBe(
      `{ _id: string; _type: 'page'; title?: string }[]`
    )
  })
})
