import type { NoteTextMessage } from './noteTextMessage.ts'
export type NoteTextChannel = {
  send: (message: NoteTextMessage) => void
  subscribe: (listener: (message: NoteTextMessage) => void) => () => void
}
