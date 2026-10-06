import { OAuth2Client } from 'google-auth-library'
const client = new OAuth2Client()
export async function verifyGoogle(
  credential: string,
  audience: string,
  nonce: string,
) {
  const ticket = await client.verifyIdToken({ idToken: credential, audience })
  const payload = ticket.getPayload()
  if (
    !payload?.sub ||
    !payload.email ||
    !payload.email_verified ||
    (payload as { nonce?: string }).nonce !== nonce
  )
    throw new Error('Google identity could not be verified.')
  return { subject: payload.sub, email: payload.email }
}
