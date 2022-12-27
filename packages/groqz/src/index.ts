import { parse } from 'groq-js'

/** @public */
export type GroqzResult = {
  query: string
  ast: unknown
}

/** @public */
export function groqz(
  strings: TemplateStringsArray,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...keys: any[]
): GroqzResult {
  const lastIndex = strings.length - 1
  const query =
    strings.slice(0, lastIndex).reduce((acc, str, i) => {
      return acc + str + keys[i]
    }, '') + strings[lastIndex]

  return { query, ast: parse(query) }
}
