import { indexQuery } from '../queries'

export default function Docs() {
  console.log(indexQuery)
  const data = indexQuery.schema.parse([
    { _id: '123', _type: 'page', title: 'Hello' },
    { _id: '456', _type: 'page' },
  ])
  console.log({ data })
  return (
    <div>
      <h1>GROQZ Documentation</h1>
    </div>
  )
}
