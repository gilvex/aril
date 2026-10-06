import type { StudioSummary } from '@pomegranate/domain/studios'
export function createWorkspaceHomeState() {
  const studios: StudioSummary[] | null = null
  const name: string = ''
  const creating: boolean = false
  const busy: boolean = false
  const error: string = ''
  const hostedOrigin: string | null = null
  return { studios, name, creating, busy, error, hostedOrigin }
}
