import groq from 'groq'
import { printQueries } from '@groqz/to-ts'
import writeFileAtomic from 'write-file-atomic'

const options = {
  dataset: [{ _type: 'page', _id: 'page', title: 'title' }],
}

const typegen = await printQueries(
  [groq`*[_type == "page"]{ _id, _type, title }`],
  options
)

await writeFileAtomic('src/queries.typegen.ts', typegen)
