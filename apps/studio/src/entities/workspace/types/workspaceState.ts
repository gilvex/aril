import type { Workspace } from '@aril/domain/workspace'
export type WorkspaceState = {
  liveFields: Record<string, import('./liveFieldPreview.ts').LiveFieldPreview>
  workspace: Workspace
  saveState: 'saved' | 'pending' | 'saving' | 'error'
  error: string
  revision: number
  historyVersion: number
  tick: number
  canUndo: boolean
  canRedo: boolean
}
