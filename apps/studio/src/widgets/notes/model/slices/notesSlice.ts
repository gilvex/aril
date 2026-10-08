import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { NotesState } from '../../types/notesState.ts'
export const notesSlice = createSlice({
  name: 'notes',
  initialState: {
    comments: false,
    commentDraft: '',
    commentQuote: '',
    showResolved: false,
    titleDraft: null,
    selected: 'project-notes',
    query: '',
    mode: 'Edit',
    list: true,
    outline: false,
    deleting: false,
  } as NotesState,
  reducers: {
    patch: (state, action: PayloadAction<Partial<NotesState>>) => {
      Object.assign(state, action.payload)
    },
  },
})
