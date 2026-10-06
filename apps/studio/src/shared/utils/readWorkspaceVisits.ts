export function readWorkspaceVisits(profileId: string): Record<string, number> {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(`pomegranate-workspace-visits:${profileId}`) || '{}',
    )
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      return {}
    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([, time]) =>
          typeof time === 'number' && Number.isFinite(time) && time > 0,
      ),
    )
  } catch {
    return {}
  }
}
