import { createIntrospectionDataset } from '@groqz/sanity'
import { printQueries } from '@groqz/to-js'
import groq from 'groq'
import writeFileAtomic from 'write-file-atomic'

const options = {
  dataset: await createIntrospectionDataset(),
}
const queries = [
  groq`*[_type in ["category", "page"]]{..., category->{title}}`,
  groq`*[_type == "category"]{title, _type, "image": image.asset->{url, size}}[0]`,
  groq`*[_type == "movie"]`,
]

await writeFileAtomic(
  'src/index.typegen.ts',
  await printQueries(queries, options)
)
