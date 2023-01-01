export type Position = { line: number; column: number; index: number }
export type Range = readonly [start: Position, end: Position]

export interface TextEdit {
  type: 'replace'
  range: Range
  newText: string
}

export interface FileTextEdit extends TextEdit {
  uri: string
}
