import type { StudioProps } from '@/pages/studio/index.ts'
import type { OpenWorkspaceSession } from './openWorkspaceSession.ts'
export type WorkspaceSessionsProps = Pick<
  StudioProps,
  'initialProfile' | 'onWorkspaces' | 'onOpenWorkspace' | 'onCloseWorkspace'
> & { sessions: OpenWorkspaceSession[]; activeId: string | null }
