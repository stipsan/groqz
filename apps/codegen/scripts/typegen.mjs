import { printQueries } from '@groqz/to-js'
import groq from 'groq'
import writeFileAtomic from 'write-file-atomic'

const options = {
  dataset: [
    {
      _type: 'page',
      _id: 'page',
      title: 'title',
      category: { _ref: 'category', _type: 'reference' },
    },
    { _type: 'category', _id: 'category', title: 'title' },
  ],
}
const queries = [
  groq`*`,
  groq`*[_type == "page"]{ ..., category-> }[0]`,
  groq`*[_type == "movie"]`,
]

await writeFileAtomic(
  'src/index.typegen.ts',
  await printQueries(queries, options)
)
