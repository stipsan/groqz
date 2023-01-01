import { groq } from 'groqz'

const data: any = []

const { schema } = groq`*[_type in ["category", "page"]]{
  _type, title, category->{title}, image{...asset->{size, originalFilename}}
}` as import('./filters.typegen').Typegen0

for (const document of schema.parse(data)) {
  switch (document._type) {
    case 'category':
      console.log(document.image?.size)
      break
    case 'page':
      console.log(document?.category?.title)
      break
  }
}
