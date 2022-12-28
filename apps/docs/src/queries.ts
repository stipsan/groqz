import { groq } from 'groqz'

export const indexQuery =
  groq`*[_type == "page"]{ _id, _type, title }` as import('./queries.typegen').gen0
