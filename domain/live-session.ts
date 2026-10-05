import { z } from 'zod'
import { presenceSchema } from './collaboration.ts'

export const liveJoinSchema = z.object({
  clientId: z.string().uuid(),
  publicKey: z.string().regex(/^[\w-]{43}$/),
})
export const certificateSchema = liveJoinSchema.extend({
  workspaceId: z.string().min(1).max(100),
  expiresAt: z.number().int(),
  profile: z.object({
    id: z.string().uuid(),
    name: z.string().max(60),
    avatar: z.string().max(180000),
    color: z.string().regex(/^#[\da-fA-F]{6}$/),
  }),
})
export type Certificate = z.infer<typeof certificateSchema>
export type SignedCertificate = { body: string; signature: string }
export type LiveState = z.infer<typeof presenceSchema>
export type LiveConfig = {
  transport: 'websocket'
  url: string
  apiKey: string
  token: string
  topic: string
  verificationKey: string
  certificate: SignedCertificate
}

const encoder = new TextEncoder()
type VerificationKey = Awaited<ReturnType<typeof crypto.subtle.importKey>>
export function encode64(value: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(value)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}
export function decode64(value: string) {
  return Uint8Array.from(
    atob(value.replaceAll('-', '+').replaceAll('_', '/')),
    (c) => c.charCodeAt(0),
  )
}
export function publicKey(value: string) {
  return crypto.subtle.importKey('raw', decode64(value), 'Ed25519', false, [
    'verify',
  ])
}
export async function signMessage(key: VerificationKey, body: string) {
  return encode64(
    await crypto.subtle.sign('Ed25519', key, encoder.encode(body)),
  )
}
export async function verifyMessage(
  key: VerificationKey,
  body: string,
  signature: string,
) {
  try {
    return await crypto.subtle.verify(
      'Ed25519',
      key,
      decode64(signature),
      encoder.encode(body),
    )
  } catch {
    return false
  }
}
export async function verifyCertificate(
  value: SignedCertificate,
  key: VerificationKey,
  workspaceId: string,
) {
  if (
    !value ||
    typeof value.body !== 'string' ||
    value.body.length > 200000 ||
    typeof value.signature !== 'string' ||
    value.signature.length > 100
  )
    return null
  if (!(await verifyMessage(key, value.body, value.signature))) return null
  try {
    const certificate = certificateSchema.parse(JSON.parse(value.body))
    return certificate.workspaceId === workspaceId &&
      certificate.expiresAt > Date.now()
      ? certificate
      : null
  } catch {
    return null
  }
}
