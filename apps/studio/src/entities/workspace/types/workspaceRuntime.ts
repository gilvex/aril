import type { Envelope, Workspace } from '@pomegranate/domain/workspace'
import type { HistoryItem } from './historyItem.ts'
import type { WorkspaceState } from './workspaceState.ts'
export type WorkspaceRuntime = {
  workspaceId: string
  current: { current: Workspace }
  base: { current: Envelope }
  saving: { current: boolean }
  blocked: { current: boolean }
  deferred: { current: Envelope | null }
  undoStack: { current: HistoryItem[] }
  redoStack: { current: HistoryItem[] }
  publish: (workspace: Workspace) => void
  receive: (envelope: Envelope) => void
  persistDraft: () => void
  setSaveState: (value: WorkspaceState['saveState']) => void
  setError: (error: string) => void
  setRevision: (revision: number) => void
  setHistoryVersion: () => void
}
