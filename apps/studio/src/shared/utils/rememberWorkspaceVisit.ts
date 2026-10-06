import { readWorkspaceVisits } from './readWorkspaceVisits.ts'

export function rememberWorkspaceVisit(profileId: string, workspaceId: string) {
  try {
    const visits = {
      ...readWorkspaceVisits(profileId),
      [workspaceId]: Date.now(),
    }
    localStorage.setItem(
      `pomegranate-workspace-visits:${profileId}`,
      JSON.stringify(
        Object.fromEntries(
          Object.entries(visits)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 200),
        ),
      ),
    )
  } catch {
    /* Workspace access does not depend on browser history storage. */
  }
}
