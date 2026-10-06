import type { Envelope, Workspace } from '../../workspace/index.ts'

export type RecoveryDraft = {
  base: Envelope
  workspace: Workspace
  writeVersion?: string
}
