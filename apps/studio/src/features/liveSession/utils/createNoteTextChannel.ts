import type { LiveDocumentMessage } from '@pomegranate/domain/liveSession'
export function createNoteTextChannel() {
  const listeners = new Set<(message: LiveDocumentMessage) => void>()
  let sender: ((message: LiveDocumentMessage) => void) | null = null
  return {
    send: (message: LiveDocumentMessage) => sender?.(message),
    setSender: (next: typeof sender) => {
      sender = next
    },
    receive: (message: LiveDocumentMessage) => {
      for (const listener of listeners) listener(message)
    },
    subscribe: (listener: (message: LiveDocumentMessage) => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
