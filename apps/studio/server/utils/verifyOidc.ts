import { createHash } from 'node:crypto'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { z } from 'zod'
import { discoverOidc } from './discoverOidc.ts'

export async function verifyOidc(
  code: string,
  verifier: string,
  redirectUri: string,
) {
  const metadata = await discoverOidc()
  const clientId = process.env.OIDC_CLIENT_ID!
  const secret = process.env.OIDC_CLIENT_SECRET!
  const methods = metadata.token_endpoint_auth_methods_supported || [
    'client_secret_basic',
  ]
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    code_verifier: verifier,
    redirect_uri: redirectUri,
  })
  const headers: Record<string, string> = {}
  if (methods.includes('client_secret_basic')) {
    const encode = (value: string) =>
      new URLSearchParams({ v: value }).toString().slice(2)
    headers.Authorization =
      'Basic ' +
      Buffer.from(encode(clientId) + ':' + encode(secret)).toString('base64')
  } else if (methods.includes('client_secret_post')) {
    body.set('client_id', clientId)
    body.set('client_secret', secret)
  } else throw new Error('Unsupported OIDC client authentication')
  const response = await fetch(metadata.token_endpoint, {
    method: 'POST',
    body,
    headers,
    signal: AbortSignal.timeout(10000),
    redirect: 'error',
  })
  if (!response.ok) throw new Error('OIDC token exchange failed')
  const tokens = z
    .object({ id_token: z.string().min(1) })
    .parse(await response.json())
  const { payload } = await jwtVerify(
    tokens.id_token,
    createRemoteJWKSet(new URL(metadata.jwks_uri)),
    {
      issuer: metadata.issuer,
      audience: clientId,
      algorithms: [
        'RS256',
        'PS256',
        'ES256',
        'ES384',
        'RS384',
        'RS512',
        'EdDSA',
      ],
      requiredClaims: ['sub', 'iss', 'aud', 'exp', 'iat', 'nonce'],
      maxTokenAge: 600,
    },
  )
  if (
    payload.nonce !==
      createHash('sha256')
        .update('oidc:' + verifier)
        .digest('base64url') ||
    (payload.azp !== undefined && payload.azp !== clientId) ||
    (Array.isArray(payload.aud) &&
      payload.aud.length > 1 &&
      payload.azp !== clientId)
  )
    throw new Error('OIDC nonce or authorized party mismatch')
  const identity = z
    .object({
      sub: z.string().min(1),
      name: z.string().optional(),
      email: z.string().email().optional(),
      email_verified: z.boolean().optional(),
    })
    .parse(payload)
  return {
    id: identity.sub,
    default_email: identity.email_verified ? identity.email || '' : '',
    display_name: identity.name || 'SSO user',
    issuer: metadata.issuer,
  }
}
