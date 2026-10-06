import { encoder } from '../config/encoder.ts'
import type { VerificationKey } from '../types/verificationKey.ts'
import { encode64 } from './encode64.ts'
export async function signMessage(key: VerificationKey, body: string) {
  return encode64(
    await crypto.subtle.sign('Ed25519', key, encoder.encode(body)),
  )
}
