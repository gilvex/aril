export function vercelPreviewOrigins(env: NodeJS.ProcessEnv = process.env) {
  if (env.VERCEL !== '1' || env.VERCEL_ENV !== 'preview') return []

  // Only trust exact deployment metadata, never a request's Host header.
  const hostPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/i
  return [
    ...new Set(
      [env.VERCEL_URL, env.VERCEL_BRANCH_URL].flatMap((host) =>
        host && host === host.trim() && hostPattern.test(host)
          ? [`https://${host.toLowerCase()}`]
          : [],
      ),
    ),
  ]
}
