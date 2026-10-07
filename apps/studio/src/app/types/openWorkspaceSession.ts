import type { Envelope } from '@pomegranate/domain/workspace'
import type { StudioSummary } from '@pomegranate/domain/studios'
import type { RecoveryDraft as Recovery } from '@pomegranate/domain/freshness'
export type OpenWorkspaceSession = {
  studio: StudioSummary
  initial: Envelope
  recovery?: Recovery
}
