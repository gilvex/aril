import type { Envelope } from '@aril/domain/workspace'
import type { StudioSummary } from '@aril/domain/studios'
import type { RecoveryDraft as Recovery } from '@aril/domain/freshness'
export type OpenWorkspaceSession = {
  studio: StudioSummary
  initial: Envelope
  recovery?: Recovery
}
