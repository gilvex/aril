import { encoder } from '../config/encoder.ts'
import type { VerificationKey } from '../types/verificationKey.ts'
import { decode64 } from './decode64.ts'
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
