export function normalizeStudioOrigins(origins: string[]) {
  return [...new Set(origins.filter(Boolean).map((value) => {
    const url = new URL(value.trim())
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash)
      throw new Error('Studio origins must be HTTP or HTTPS origins without credentials, paths, queries or fragments.')
    return url.origin
  }))]
}
