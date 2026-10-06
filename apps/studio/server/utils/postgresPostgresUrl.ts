export function postgresUrl() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!url) throw new Error('A Postgres connection URL is required.')
  return url
}
