import groq from 'groq'
import { printQueries as printTsQueries } from '@groqz/to-ts'
import { printQueries as printJsQueries } from '@groqz/to-js'
import writeFileAtomic from 'write-file-atomic'

const options = {
  dataset: [{ _type: 'page', _id: 'page', title: 'title' }],
}
const queries = [groq`*[_type == "page"]{ _id, _type, title }`]

await writeFileAtomic(
  'src/queries.typegen.ts',
  await printTsQueries(queries, options)
)

await writeFileAtomic(
  'src/queries.typegen.js',
  await printJsQueries(queries, options)
)
