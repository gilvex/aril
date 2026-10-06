import type { StudioSummary } from '@pomegranate/domain/studios'
import type { Envelope } from '@pomegranate/domain/workspace'

export type AgentWorkspace = Envelope & {
  studio: StudioSummary
  scope: 'read' | 'write'
}
