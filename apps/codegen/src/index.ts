import { type InferType } from 'groqz'

import { gen0, gen1, gen2 } from './index.typegen'

const index = gen0

console.log(index.query.toLowerCase())

function reportEverything(data: InferType<typeof index>) {
  for (const item of data) {
    switch (item._type) {
      case 'category':
        reportCategory(item)
        break
      case 'page':
        console.log(item, item.category?._ref?.toUpperCase())
        break
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      case 'random':
        console.log(item)
        break
    }
  }
}

reportEverything(index.schema.parse([]))

function reportCategory(category: {
  _type: 'category'
  _id: string
  title?: string | null
}) {
  console.log(category)
}

const page = gen1

console.log(page.schema.parse({}).category?.title?.toUpperCase())
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
console.log(page.schema.parse({}).category.title.toUpperCase())

const anything = gen2

console.log(
  anything.query.toLowerCase(),
  anything.schema.parse({})[0],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  anything.schema.parse({})._type
)
