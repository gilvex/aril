import type { HistoryItem } from '@/entities/workspace/types/historyItem.ts'
import type { WorkspaceState } from '@/entities/workspace/types/workspaceState.ts'
import type { Envelope, Workspace } from '@pomegranate/domain/workspace'
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
