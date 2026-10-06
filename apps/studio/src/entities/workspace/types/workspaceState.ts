import type { Workspace } from '@pomegranate/domain/workspace'
export type WorkspaceState = {
  workspace: Workspace
  saveState: 'saved' | 'pending' | 'saving' | 'error'
  error: string
  revision: number
  historyVersion: number
  tick: number
  canUndo: boolean
  canRedo: boolean
}
