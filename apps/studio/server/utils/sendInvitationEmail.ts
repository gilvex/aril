export async function sendInvitationEmail(
  id: string,
  email: string,
  workspace: string,
  inviter: string,
  origin: string,
) {
  const apiKey = process.env.RESEND_API_KEY,
    from = process.env.ARIL_EMAIL_FROM
  if (!apiKey || !from || !origin) return 'unconfigured' as const
  const url = new URL('/app', origin)
  url.hash = 'invite=' + id
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `invitation/${id}`,
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'You are invited to an Aril workspace',
        text: `${inviter} invited you to ${workspace}.\n\nSign in with this email address to accept or decline in Aril:\n${url.href}\n\nThis invitation expires in 7 days. If you were not expecting it, you can ignore this email.`,
      }),
    })
    return response.ok ? ('sent' as const) : ('failed' as const)
  } catch {
    return 'failed' as const
  }
}
