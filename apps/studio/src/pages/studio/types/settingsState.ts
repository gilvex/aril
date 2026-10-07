import type {
  StudioSummary,
  WorkspaceMember,
} from '@pomegranate/domain/studios'
export type SettingsState = {
  section: 'file' | 'user' | 'app' | 'agents'
  role: StudioSummary['role'] | null
  members: WorkspaceMember[]
  loading: boolean
  busy: boolean
  error: string
  confirming: string | null
}
