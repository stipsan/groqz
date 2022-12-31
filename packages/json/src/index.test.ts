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
