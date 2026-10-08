import type { NoteTextMessage } from '@pomegranate/domain/noteText'
export function createNoteTextChannel() {
  const listeners = new Set<(message: NoteTextMessage) => void>()
  let sender: ((message: NoteTextMessage) => void) | null = null
  return {
    send: (message: NoteTextMessage) => sender?.(message),
    setSender: (next: typeof sender) => {
      sender = next
    },
    receive: (message: NoteTextMessage) => {
      for (const listener of listeners) listener(message)
    },
    subscribe: (listener: (message: NoteTextMessage) => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
