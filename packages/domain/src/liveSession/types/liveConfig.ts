import type { SignedCertificate } from './signedCertificate.ts'
export type LiveConfig = {
  transport: 'websocket'
  refreshAfterMs?: number
  url: string
  apiKey: string
  token: string
  topic: string
  verificationKey: string
  certificate: SignedCertificate
}
