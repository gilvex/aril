import { Studio } from '@/pages/studio/index.ts'
import type { WorkspaceSessionsProps } from '../types/workspaceSessionsProps.ts'
export function WorkspaceSessions({
  sessions,
  activeId,
  ...props
}: WorkspaceSessionsProps) {
  return sessions.map((entry) => (
    <div
      key={entry.studio.id}
      className="workspace-session"
      hidden={entry.studio.id !== activeId}
      inert={entry.studio.id !== activeId}
    >
      <Studio {...entry} {...props} active={entry.studio.id === activeId} />
    </div>
  ))
}
