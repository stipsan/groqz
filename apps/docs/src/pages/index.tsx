import type { InferType } from 'groqz'

import { indexQuery } from '../queries'

export default function Docs() {
  console.log(indexQuery)
  const data = indexQuery.schema.parse([
    { _id: '123', _type: 'page', title: 'Hello' },
    { _id: '456', _type: 'page' },
  ])
  console.log(data.length)
  // @ts-expect-error -- data is an array
  console.log(data.title)
  return (
    <div>
      <h1>GROQZ Documentation</h1>
      <ListPages data={data} />
    </div>
  )
}

function ListPages({ data }: { data: InferType<typeof indexQuery> }) {
  return (
    <ul>
      {data.map((page) => (
        <li key={page._id} data-type={page._type}>
          {page.title || 'Untitled'}
        </li>
      ))}
    </ul>
  )
}
