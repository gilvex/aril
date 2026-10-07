import type { WorkspaceMember } from '@pomegranate/domain/studios'
import type { useSettings } from '../model/useSettings.ts'
export type SettingsMemberProps = {
  member: WorkspaceMember
  settings: ReturnType<typeof useSettings>
  currentUserId: string
}
