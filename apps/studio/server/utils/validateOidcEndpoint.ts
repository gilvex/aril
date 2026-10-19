export function validateOidcEndpoint(endpoint: string) {
  const url = new URL(endpoint)
  if (
    url.protocol !== 'https:' &&
    !(
      url.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    )
  )
    throw new Error('OIDC requires HTTPS')
  if (url.username || url.password) throw new Error('Invalid OIDC endpoint')
  return url
}
