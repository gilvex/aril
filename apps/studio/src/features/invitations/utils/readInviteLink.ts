export function readInviteLink(value: string) {
  const text = value.trim()
  if (/^[\w-]{20,100}$/.test(text)) return text
  try {
    const url = new URL(text)
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.origin !== location.origin
    )
      return ''
    return new URLSearchParams(url.hash.slice(1)).get('invite') || ''
  } catch {
    return ''
  }
}
