import { diffWorkspace, type Operation } from './collaboration.ts'
import type { Envelope, Workspace } from './workspace.ts'

// Bump when older clients can no longer safely describe the current document.
export const writeVersion = '2'
export const writeVersionHeader = 'x-pomegranate-write-version'
export type RecoveryDraft = {
  base: Envelope
  workspace: Workspace
  writeVersion?: string
}

export function isFreshDraft(draft: RecoveryDraft, latest: Envelope) {
  return (
    draft.writeVersion === writeVersion &&
    draft.base.revision === latest.revision &&
    diffWorkspace(draft.base.workspace, latest.workspace).length === 0
  )
}

export const canRebaseOperations = (operations: Operation[]) =>
  operations.every((op) => op.after !== undefined)
