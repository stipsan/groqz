import { parse as _parse } from 'groq-js'

/**
 * This JSON.stringify replacer and JSON.parse reviver function compacts the AST returned by groq-js and removes anything
 * that isn't needed to perform introspection.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function compacter(key: string, value: any): any {
  if (typeof value === 'object') {
    /**
     * Replaces operator calls with `true` to be compatible with introspection
     * Except for `_type` queries, which are used to determine the type of the document
     */
    if (key === 'expr' || key === 'left' || key === 'right') {
      if (value.type === 'OpCall') {
        if (
          (value.left.type === 'AccessAttribute' &&
            value.left.name !== '_type') ||
          (value.right.type === 'AccessAttribute' &&
            value.right.name !== '_type')
        ) {
          return { type: 'Value', value: true }
        }
      }
    }

    /**
     * Strips `[0..2]` and `[0...2]` syntax
     */
    if (value?.type === 'Slice') {
      return value.base
    }

    /**
     * Strips `| order()` and other pipe functions
     */
    if (value?.type === 'PipeFuncCall') {
      return value.base
    }

    /**
     * Changes array accessors to always use `0` as the index, to be compatible with introspection
     */
    if (value?.type === 'AccessElement') {
      // index must always be 0, due to how `evaluate` works
      return { ...value, index: 0 }
    }
  }

  return value
}

/**
 * Takes a string, parses it with groq-js and returns a compact AST ready for conversion to Zod
 * @alpha
 */
export function parse(query: string) {
  const ast = JSON.parse(JSON.stringify(_parse(query), compacter), compacter)

  return ast
}
