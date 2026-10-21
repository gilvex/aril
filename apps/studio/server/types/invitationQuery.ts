export type InvitationQuery = (
  sql: string,
  values: (string | number | null)[],
) => Promise<Record<string, unknown>[]>
