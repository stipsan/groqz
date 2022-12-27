import { groqz } from 'groqz'

export default function Docs() {
  console.log(groqz`*[_type == "page"]{_id,_type, title}`)
  return (
    <div>
      <h1>GROQZ Documentation</h1>
    </div>
  )
}
