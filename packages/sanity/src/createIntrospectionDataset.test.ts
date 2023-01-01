import { expect, test } from 'vitest'

import { createIntrospectionDataset } from './createIntrospectionDataset'

test('createIntrospectionDataset', async () => {
  expect(await createIntrospectionDataset('default')).toMatchInlineSnapshot(
    'undefined'
  )
})
