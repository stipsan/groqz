import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'

import { ALLOWED_IMPORT_SPECIFIER_SOURCE } from './machineCallExpression'

export const getQueryNodesFromFile = (fileContent: string) => {
  const file = parse(fileContent, {
    sourceType: 'module',
    plugins: [
      'typescript',
      'jsx',
      ['decorators', { decoratorsBeforeExport: false }],
    ],
    // required by recast
    tokens: true,
  })

  let taggedTemplateLiteral: string | false = false

  traverse(file, {
    ImportDeclaration({ node }) {
      if (node.source.value === ALLOWED_IMPORT_SPECIFIER_SOURCE) {
        const groqNode = node.specifiers.find(
          (specifier) =>
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.type === 'Identifier' &&
            specifier.imported.name === 'groq'
        )
        if (groqNode) {
          taggedTemplateLiteral = groqNode.local.name
        }
      }
    },
  })

  if (!taggedTemplateLiteral) {
    return {
      file,
      queries: [],
    }
  }

  const queries: Array<t.TaggedTemplateExpression> = []

  traverse(file, {
    TaggedTemplateExpression(path) {
      const node = path.node
      if (t.isIdentifier(node.tag) && node.tag.name === taggedTemplateLiteral) {
        queries.push(node)
      }
    },
  })

  return {
    file,
    queries,
  }
}
