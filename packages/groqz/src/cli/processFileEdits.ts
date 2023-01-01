export const processFileEdits = (
  oldText: string,
  textEdits: { newText: string; range: [number, number] }[]
): string => {
  const sortedEdits = [...textEdits].sort((a, b) => b.range[0] - a.range[0])

  let newText = oldText

  for (const edit of sortedEdits) {
    newText =
      newText.slice(0, edit.range[0]) +
      edit.newText +
      newText.slice(edit.range[1])
  }

  return newText
}
