import * as t from '@babel/types'

export interface FileExtractResult {
  nodes: (t.TaggedTemplateExpression | t.TSAsExpression)[]
  file: t.File
}
