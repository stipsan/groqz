import { groq } from 'groqz'

const query1 =
  groq`*[_type in ["category", "page"]]{..., category->{title}}` as import('./arrays.typegen').Typegen0
const query2 =
  groq`*[_type == "category"]{title, _type, "image": image.asset->{url, size}}[0]` as import('./arrays.typegen').Typegen1
const query3 = groq`*[_type == "movie"]` as import('./arrays.typegen').Typegen2

console.log(
  query1.schema
    .parse([
      { _type: 'category', title: 'Category' },
      { _type: 'page', title: 'Page' },
    ])
    .map((item) => item.title?.toUpperCase())
)

console.log(
  query2.schema.parse({
    _type: 'category',
    title: 'Category',
    image: { url: 'https://example.com/image.png', size: 1024 },
  }).image?.url
)

console.log(query3.schema.parse([{ _type: 'movie' }])[0])
