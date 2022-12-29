import { type OpCall, parse as _parse } from 'groq-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const funcCallCache = new Map<string, any>()

/**
 * This JSON.stringify replacer and JSON.parse reviver function compacts the AST returned by groq-js and removes anything
 * that isn't needed to perform introspection.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function compacter(key: string, value: any): any {
  if (typeof value === 'object') {
    /**
     * Turns `popularity > 5 => "result"` to `true => "result" and `popularity > 5 => {splat}` to `true => {splat}`
     */
    /*
    if (
      value?.type === 'SelectAlternative' ||
      value?.type === 'ObjectConditionalSplat'
    ) {
      return { ...value, condition: { type: 'Value', value: true } }
    }
    // */

    /**
     * Handle coalesce functions
     */
    if (value?.type === 'FuncCall') {
      if (value.func) {
        funcCallCache.set(value.name, value.func)
        return value
      }
      if (funcCallCache.has(value.name)) {
        return { ...value, func: funcCallCache.get(value.name) }
      }
    }

    /**
     * Replaces operator calls with `true` to be compatible with introspection
     * Except for `_type` queries, which are used to determine the type of the document
     */
    if (value?.type === 'OpCall') {
      switch (value.op as OpCall) {
        /**
         * Operators to evaluate during introspection
         */
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
        case '**':
          return value
        /**
         * Comparison operators that don't need to be evaulated, treat them as `true`
         */
        case '>':
        case '>=':
        case '<':
        case '<=':
        case 'match':
          return { type: 'Value', value: true }
        /**
         * Allow `in` to introspect queries like `_type in ["movie", "person"]`
         */
        case 'in':
          return value.left.type === 'AccessAttribute' &&
            value.left.name === '_type'
            ? value
            : { type: 'Value', value: true }
        /**
         * Handle the common `_type == "movie"` styles of filters, and run them during introspection
         * to allow generating rich `z.enum` and `z.object` schemas.
         */
        case '==':
        case '!=':
          return (value.left.type === 'AccessAttribute' &&
            value.left.name === '_type') ||
            (value.right.type === 'AccessAttribute' &&
              value.right.name === '_type')
            ? value
            : { type: 'Value', value: true }
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
