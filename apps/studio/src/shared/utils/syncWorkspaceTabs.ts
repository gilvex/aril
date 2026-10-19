import type { StudioSummary } from '@aril/domain/studios'

export function syncWorkspaceTabs(
  profileId: string,
  available: StudioSummary[],
) {
  try {
    const key = `aril:workspaceTabs:${profileId}`
    const saved: unknown = JSON.parse(sessionStorage.getItem(key) || '[]')
    const current = new Map(available.map((studio) => [studio.id, studio]))
    const seen = new Set<string>()
    const tabs: StudioSummary[] = []
    if (Array.isArray(saved))
      for (const item of saved) {
        const studio =
          item && typeof item.id === 'string' ? current.get(item.id) : undefined
        if (!studio || seen.has(studio.id)) continue
        seen.add(studio.id)
        tabs.push({
          id: studio.id,
          name: studio.name,
          role: studio.role,
          createdAt: studio.createdAt,
        })
      }
    sessionStorage.setItem(key, JSON.stringify(tabs))
    return tabs
  } catch {
    // An unavailable preference store must not close in-memory editors.
    return null
  }
}
