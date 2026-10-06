import { decode64 } from './decode64.ts'
export function publicKey(value: string) {
  return crypto.subtle.importKey('raw', decode64(value), 'Ed25519', false, [
    'verify',
  ])
}
