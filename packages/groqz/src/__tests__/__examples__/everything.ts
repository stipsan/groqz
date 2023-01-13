import { groq } from 'groqz'

const { schema } = groq`*` as import('./everything.typegen').Typegen0

for (const document of schema.parse([])) {
  switch (document._type) {
    case 'category':
    case 'page':
    case 'sanity.imageAsset':
      break
    default:
      throw new Error(`Unexpected document type: ${document._type}`)
  }
}

const { schema: schema1 } = groq`*[
    _type in ["category", "page", "sanity.imageAsset"]
  ]` as import('./everything.typegen').Typegen1

for (const document of schema1.parse([])) {
  switch (document._type) {
    case 'category':
    case 'page':
    case 'sanity.imageAsset':
      break
    default:
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      throw new Error(`Unexpected document type: ${document._type}`)
  }
}

const { schema: schema2 } =
  groq`{"foo": [2] + ["3"], "category": *[_type == "category"].image.asset->, "count": count(*)}` as import('./everything.typegen').Typegen2

const document = schema2.parse('string')
console.log(document)
