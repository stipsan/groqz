/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect, test } from 'vitest'

import { json as schema } from './index'

test('parsing', async () => {
  expect(schema.parse([])).toEqual([])
  expect(schema.parse({})).toEqual({})
  expect(schema.parse(null)).toEqual(null)
  expect(schema.parse([{}, 1])).toEqual([{}, 1])
  expect(() => schema.parse(NaN)).toThrowErrorMatchingSnapshot()
  expect(() => schema.parse([NaN])).toThrowErrorMatchingSnapshot()
  expect(schema.parse({ count: 0 })).toEqual({ count: 0 })
  expect(schema.parse(3)).toEqual(3)
})

test('array', async () => {
  const result = schema.parse([1, 2, 3, { foo: { bar: { baz: 'qux' } } }])

  // Doing the right checks allows deep traversal in a type-safe way
  expect(
    Array.isArray(result) &&
      typeof result[3] === 'object' &&
      !Array.isArray(result[3]) &&
      typeof result[3]?.foo === 'object' &&
      !Array.isArray(result[3].foo) &&
      typeof result[3].foo?.bar === 'object' &&
      !Array.isArray(result[3].foo.bar) &&
      result[3].foo.bar !== null
      ? result[3].foo.bar.baz
      : null
  ).toEqual('qux')

  // Removing null checks should fail
  expect(
    Array.isArray(result) &&
      typeof result[3] === 'object' &&
      !Array.isArray(result[3]) &&
      typeof result[3]?.foo === 'object' &&
      !Array.isArray(result[3].foo) &&
      typeof result[3].foo?.bar === 'object' &&
      !Array.isArray(result[3].foo.bar) &&
      result[3].foo.bar !== undefined
      ? // @ts-expect-error
        result[3].foo.bar.baz
      : null
  ).toEqual('qux')
  // Removing the isArray check should throw a type-error since property accessing
  // `foo.bar.baz` will throw a runtime error if `foo.bar` is an array
  expect(
    Array.isArray(result) &&
      typeof result[3] === 'object' &&
      !Array.isArray(result[3]) &&
      typeof result[3]?.foo === 'object' &&
      !Array.isArray(result[3].foo) &&
      typeof result[3].foo?.bar === 'object' &&
      result[3].foo.bar !== null &&
      result[3].foo.bar !== undefined
      ? // @ts-expect-error
        result[3].foo.bar.baz
      : null
  ).toEqual('qux')
  // Removing the `typeof object` check should throw as `foo.bar` might be a number or a string
  expect(
    Array.isArray(result) &&
      typeof result[3] === 'object' &&
      !Array.isArray(result[3]) &&
      typeof result[3]?.foo === 'object' &&
      !Array.isArray(result[3].foo) &&
      !Array.isArray(result[3].foo?.bar) &&
      result[3].foo?.bar !== null &&
      result[3].foo?.bar !== undefined
      ? // @ts-expect-error
        result[3].foo.bar.baz
      : null
  ).toEqual('qux')
})
