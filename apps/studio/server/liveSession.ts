import type { Profile } from '@pomegranate/domain/collaboration'
import type { LiveConfig } from '@pomegranate/domain/liveSession'
import {
  createHash,
  createHmac,
  createPrivateKey,
  createPublicKey,
  sign,
} from 'node:crypto'

export function createLiveSession(
  workspaceId: string,
  profile: Profile,
  clientId: string,
  publicKey: string,
): LiveConfig {
  const secret = process.env.SUPABASE_JWT_SECRET
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_DATABASESUPABASE_URL
  const apiKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_DATABASESUPABASE_ANON_KEY
  if (!secret || !url || !apiKey)
    throw new Error('Realtime configuration is missing')
  const topic = `pomegranate:live:${workspaceId}`
  const expiresAt = profile.guestExpiresAt
    ? Math.min(profile.guestExpiresAt, Date.now() + 30000)
    : Date.now() + 5 * 60 * 1000
  const encoded = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url')
  const claims = encoded({
    role: 'authenticated',
    aud: 'authenticated',
    sub: profile.id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(expiresAt / 1000),
    pomegranate_topic: topic,
  })
  const unsigned = `${encoded({ alg: 'HS256', typ: 'JWT' })}.${claims}`
  const token = `${unsigned}.${createHmac('sha256', secret).update(unsigned).digest('base64url')}`
  // Separate signing purpose from the Supabase JWT. Only the public verification
  // key reaches clients; each tab owns its own ephemeral message-signing key.
  const seed = createHash('sha256')
    .update('pomegranate-live-identity-v1\0')
    .update(secret)
    .digest()
  const key = createPrivateKey({
    key: Buffer.concat([
      Buffer.from('302e020100300506032b657004220420', 'hex'),
      seed,
    ]),
    format: 'der',
    type: 'pkcs8',
  })
  const body = JSON.stringify({
    workspaceId,
    profile,
    clientId,
    publicKey,
    expiresAt,
  })
  return {
    transport: 'websocket',
    refreshAfterMs: profile.guestExpiresAt ? 15000 : 240000,
    url,
    apiKey,
    token,
    topic,
    verificationKey: createPublicKey(key).export({ format: 'jwk' }).x!,
    certificate: {
      body,
      signature: sign(null, Buffer.from(body), key).toString('base64url'),
    },
  }
}
