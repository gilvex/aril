import { z } from 'zod'

export async function verifyYandex(
  code: string,
  verifier: string,
  redirectUri: string,
) {
  const response = await fetch('https://oauth.yandex.ru/token', {
    method: 'POST',
    signal: AbortSignal.timeout(10000),
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      code_verifier: verifier,
      redirect_uri: redirectUri,
      client_id: process.env.YANDEX_CLIENT_ID!,
      client_secret: process.env.YANDEX_CLIENT_SECRET!,
    }),
  })
  if (!response.ok) throw new Error('Yandex token exchange failed')
  const token = z
    .object({ access_token: z.string().min(1) })
    .parse(await response.json())
  const info = await fetch('https://login.yandex.ru/info?format=json', {
    headers: { Authorization: `OAuth ${token.access_token}` },
    signal: AbortSignal.timeout(10000),
  })
  if (!info.ok) throw new Error('Yandex identity verification failed')
  return z
    .object({
      id: z.string().min(1),
      default_email: z.string().email(),
      display_name: z.string().optional(),
    })
    .parse(await info.json())
}
