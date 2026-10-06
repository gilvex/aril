export function formatNote(
  body: string,
  start: number,
  end: number,
  format: string,
) {
  const selection = body.slice(start, end)
  const wrappers: Record<string, [string, string]> = {
    Bold: ['**', '**'],
    Italic: ['_', '_'],
    Link: ['[', '](https://)'],
  }
  const wrapper = wrappers[format]
  if (wrapper) {
    const content = selection || 'text'
    return {
      body:
        body.slice(0, start) +
        wrapper[0] +
        content +
        wrapper[1] +
        body.slice(end),
      start: start + wrapper[0].length,
      end: start + wrapper[0].length + content.length,
    }
  }
  const lineStart = body.lastIndexOf('\n', start - 1) + 1
  const prefix =
    format === 'Heading' ? '## ' : format === 'Checklist' ? '- [ ] ' : '- '
  const content = body
    .slice(lineStart, end)
    .split('\n')
    .map((line) => prefix + line)
    .join('\n')
  return {
    body: body.slice(0, lineStart) + content + body.slice(end),
    start: lineStart,
    end: lineStart + content.length,
  }
}
