import { validateOidcEndpoint } from './validateOidcEndpoint.ts'
import { z } from 'zod'

export async function discoverOidc() {
  const issuer = process.env.OIDC_ISSUER!
  const issuerUrl = validateOidcEndpoint(issuer)
  if (issuerUrl.search || issuerUrl.hash) throw new Error('Invalid OIDC issuer')
  const response = await fetch(
    issuer.replace(/\/$/, '') + '/.well-known/openid-configuration',
    { signal: AbortSignal.timeout(10000), redirect: 'error' },
  )
  if (!response.ok) throw new Error('OIDC discovery failed')
  const metadata = z
    .object({
      issuer: z.string(),
      authorization_endpoint: z.string().url(),
      token_endpoint: z.string().url(),
      jwks_uri: z.string().url(),
      token_endpoint_auth_methods_supported: z.array(z.string()).optional(),
    })
    .parse(await response.json())
  if (metadata.issuer !== issuer) throw new Error('OIDC issuer mismatch')
  for (const endpoint of [
    issuer,
    metadata.authorization_endpoint,
    metadata.token_endpoint,
    metadata.jwks_uri,
  ]) {
    validateOidcEndpoint(endpoint)
  }
  return metadata
}
