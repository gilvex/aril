export function downloadCanvasData(data: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'aril-canvas.json'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
