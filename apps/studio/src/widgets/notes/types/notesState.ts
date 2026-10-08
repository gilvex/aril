export type NotesState = {
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
