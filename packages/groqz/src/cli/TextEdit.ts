export interface TextEdit {
  type: 'replace'
  range: Range
  newText: string
}
