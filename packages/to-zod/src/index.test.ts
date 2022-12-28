import { expect, it, describe } from 'vitest'
import { printZodFromGroq } from './index'
import groq from 'groq'

describe.concurrent('printZodFromGroq', () => {
  it('Filters', () => {
    expect(printZodFromGroq(groq`*`)).toBe(`z.array(z.unknown())`)
    expect(printZodFromGroq(groq`*[]`)).toBe(`z.array(z.unknown())`)
    expect(printZodFromGroq(groq`*[_type == "movie"]`)).toBe(
      `z.array(z.unknown())`
    )
    expect(
      printZodFromGroq(
        groq`*["person_sigourney-weaver" in castMembers[].person._ref]`
      )
    ).toBe(`z.array(z.unknown())`)
    expect(printZodFromGroq(groq`*[slug.current == "some-slug"]`)).toBe(
      `z.array(z.unknown())`
    )
  })

  it('Text matching', () => {
    expect(printZodFromGroq(groq`*[text match "word"]`)).toBe(
      `z.array(z.unknown())`
    )
    expect(printZodFromGroq(groq`*[[title, body] match ["wo*", "zero"]]`)).toBe(
      `z.array(z.unknown())`
    )
    expect(
      printZodFromGroq(groq`*[body[].children[].text match "aliens"]`)
    ).toBe(`z.array(z.unknown())`)
    expect(printZodFromGroq(groq`"foo bar" match "fo*"`)).toBe(`z.boolean()`)
    expect(
      printZodFromGroq(groq`"my-pretty-pony-123.jpg" match "my*.jpg"`)
    ).toBe(`z.boolean()`)
  })

  it('Slice Operations', () => {
    expect(printZodFromGroq(groq`*[_type == "movie"][0]`)).toBe(`z.unknown()`)
    expect(printZodFromGroq(groq`*[_type == "movie"][0..5]`)).toBe(
      `z.array(z.unknown()).max(6)`
    )
    expect(printZodFromGroq(groq`*[_type == "movie"][0...5]`)).toBe(
      `z.array(z.unknown()).max(5)`
    )
    expect(printZodFromGroq(groq`*[_type == "movie"]{title}[0...10]`)).toBe(
      `z.array(z.object({title: z.string()})).max(10)`
    )
    expect(printZodFromGroq(groq`*[_type == "movie"][0...10]{title}`)).toBe(
      `z.array(z.object({title: z.string()})).max(10)`
    )
    expect(printZodFromGroq(groq`*[_type == "movie"][10...20]{title}`)).toBe(
      `z.array(z.object({title: z.string()})).max(10)`
    )
  })

  it('Ordering', () => {
    expect(
      printZodFromGroq(
        groq`*[_type == "movie"] | order(releaseDate desc) | order(_createdAt asc)`
      )
    ).toBe(`z.array(z.unknown())`)
    expect(
      printZodFromGroq(groq`*[_type == "movie"][0..9] | order(_createdAt asc)`)
    ).toBe(`z.array(z.unknown())`)
  })

  it('Joins', () => {
    //
  })

  it('Objects and Arrays', () => {
    //
  })
  it('Object Projections', () => {
    //
  })

  it('Special variables', () => {
    //
  })
  it('Conditionals', () => {
    //
  })
  it('Functions', () => {
    //
  })
  it('Geolocation', () => {
    //
  })
  it('Arithmetic and Concatenation', () => {
    expect(printZodFromGroq(groq`1 + 2`)).toBe(`z.number()`)
    expect(printZodFromGroq(groq`3 - 2`)).toBe(`z.number()`)
    expect(printZodFromGroq(groq`2 * 3`)).toBe(`z.number()`)
    expect(printZodFromGroq(groq`8 / 4`)).toBe(`z.number()`)
    expect(printZodFromGroq(groq`2 ** 4`)).toBe(`z.number()`)
    expect(printZodFromGroq(groq`8 % 3`)).toBe(`z.number()`)
    expect(printZodFromGroq(groq`9 ** (1/2)`)).toBe(`z.number()`)
    expect(printZodFromGroq(groq`27 ** (1/3)`)).toBe(`z.number()`)
    expect(printZodFromGroq(groq`"abc" + "def"`)).toBe(`z.string()`)
    expect(printZodFromGroq(groq`[1,2] + [3,4]`)).toBe(`z.array(z.number())`)
    expect(printZodFromGroq(groq`[1,"2"] + ["3",4]`)).toBe(
      `z.array(z.union([z.number(), z.string()]))`
    )
    expect(printZodFromGroq(groq`{"a":1,"b":2} + {"c":3}`)).toBe(
      `z.record(z.number())`
    )
    expect(printZodFromGroq(groq`{"a":1,"b":2} + {"c":"d"}`)).toBe(
      `z.record(z.union([z.number(), z.string()]))`
    )
  })
})
