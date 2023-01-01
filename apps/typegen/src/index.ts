import { type InferType, groq } from 'groqz'

const index =
  groq`*[_type in ["cateogry", "page"]]{..., category->}` as import('./index.typegen').gen0

console.log(index.query.toLowerCase())

function reportEverything(data: InferType<typeof index>) {
  for (const item of data) {
    switch (item._type) {
      case 'category':
        reportCategory(item)
        break
      case 'page':
        console.log(item, item.category?.title?.toUpperCase())
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

const page =
  groq`*[_type == "category"]{title, _type, "image": image.asset->{url, size}}` as import('./index.typegen').gen1

console.log(page.schema.parse({}).title?.toUpperCase())
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
console.log(page.schema.parse({}).image?.size?.toUpperCase())
console.log((page.schema.parse({}).image?.size || 0) / 1024)

const anything = groq`*[_type == "movie"]` as import('./index.typegen').gen2

console.log(
  anything.query.toLowerCase(),
  anything.schema.parse({})[0],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  anything.schema.parse({})._type
)
