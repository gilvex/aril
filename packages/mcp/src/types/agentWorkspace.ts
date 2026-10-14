import type { StudioSummary } from '@aril/domain/studios'
import type { Envelope } from '@aril/domain/workspace'

export type AgentWorkspace = Envelope & {
  studio: StudioSummary
  scope: 'read' | 'write'
}
