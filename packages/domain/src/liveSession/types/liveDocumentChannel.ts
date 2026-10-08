import type { LiveDocumentMessage } from './liveDocumentMessage.ts'
export type LiveDocumentChannel = {
  send: (message: LiveDocumentMessage) => void
  subscribe: (listener: (message: LiveDocumentMessage) => void) => () => void
}
