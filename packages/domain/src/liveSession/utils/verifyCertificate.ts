import { certificateSchema } from '../config/certificateSchema.ts'
import type { SignedCertificate } from '../types/signedCertificate.ts'
import type { VerificationKey } from '../types/verificationKey.ts'
import { verifyMessage } from './verifyMessage.ts'
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
