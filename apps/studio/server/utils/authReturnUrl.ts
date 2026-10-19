export function authReturnUrl(candidate: unknown, origin: string) {
  if (
    typeof candidate !== 'string' ||
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('\\') ||
    [...candidate].some(
      (character) =>
        character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
    ) ||
    encodeURIComponent(candidate).length > 2000
  )
    return new URL('/', origin)
  const url = new URL(candidate, origin)
  return url.origin === new URL(origin).origin ? url : new URL('/', origin)
}
