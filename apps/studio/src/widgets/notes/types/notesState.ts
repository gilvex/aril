export type NotesState = {
  composition: {
    id: string
    body: string
    base: import('@pomegranate/domain/noteText').NoteTextState
  } | null
  liveText: Record<string, import('@pomegranate/domain/noteText').NoteTextState>

  comments: boolean
  commentDraft: string
  commentQuote: string
  showResolved: boolean
  titleDraft: string | null
  selected: string
  query: string
  mode: 'Edit' | 'Split' | 'Read'
  list: boolean
  outline: boolean
  deleting: boolean
}
