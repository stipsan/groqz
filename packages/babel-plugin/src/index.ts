import { type ConfigAPI, types as t } from '@babel/core'
import { declare } from '@babel/helper-plugin-utils'

/** @public */
export default declare((api, options = {}): ConfigAPI => {
  api.assertVersion(7)
  const { importSources = ['groqz'], groqTagIdentifiers = ['groq'] } = options

  return {
    name: 'groqz',

    visitor: {
      TaggedTemplateExpression(path) {
        const node = path.node
        if (
          t.isIdentifier(node.tag) &&
          groqTagIdentifiers.includes(node.tag.name)
        ) {
          //
          //console.log(node)
        }
      },
    },
  }
})
