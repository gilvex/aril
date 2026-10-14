import type { Operation } from '@aril/domain/collaboration'
import type {
  LiveDocumentChannel,
  LiveFieldsMessage,
} from '@aril/domain/liveSession'
export type LiveWorkspaceFieldsOptions = {
  receiveFields: (message: LiveFieldsMessage) => void
  pruneFields: () => void
  pendingFields: () => Operation[]
  subscribeFields: (listener: () => void) => () => void
  channel: LiveDocumentChannel
  clientId: string
  canEdit: boolean
}
