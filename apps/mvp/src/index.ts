import { type InferType, groq } from 'groqz'

const index = groq`*[_type == "page"]{ _id, _type, title }`
const { query, schema } = index

console.log(query.toLowerCase())

function report(data: InferType<typeof index>) {
  if (Array.isArray(data)) {
    const result = data[0]
    return result
  }
  if (typeof data === 'object') {
    return data
  }
  if (typeof data === 'string') {
    return data.toUpperCase()
  }
  if (typeof data === 'boolean') {
    return !data
  }
  return data * 2
}

console.log(report(schema.parse(null)))
