import { useCallback, useMemo } from 'react'
import type { FormEvent } from 'react'
import type { NoteEditorProps } from '../types/noteEditorProps.ts'

export function useNoteComments({ model, workspace }: NoteEditorProps) {
  const { note, state, patch, change, profile } = model
  const comments = useMemo(
    () =>
      (workspace.noteComments || []).filter(
        (comment) => comment.noteId === note.id,
      ),
    [workspace.noteComments, note.id],
  )
  const post = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      const body = state.commentDraft.trim()
      if (!body || (workspace.noteComments?.length || 0) >= 1000) return
      change((current) => ({
        ...current,
        noteComments: [
          ...(current.noteComments || []),
          {
            id: crypto.randomUUID(),
            noteId: note.id,
            authorId: profile.id,
            authorName: profile.name,
            body,
            quote: state.commentQuote,
            createdAt: Date.now(),
            resolved: false,
          },
        ],
      }))
      patch({ commentDraft: '', commentQuote: '' })
    },
    [
      change,
      note.id,
      patch,
      profile.id,
      profile.name,
      state.commentDraft,
      state.commentQuote,
      workspace.noteComments?.length,
    ],
  )
  const resolve = useCallback(
    (id: string) =>
      change((current) => ({
        ...current,
        noteComments: current.noteComments?.map((comment) =>
          comment.id === id
            ? { ...comment, resolved: !comment.resolved }
            : comment,
        ),
      })),
    [change],
  )
  const remove = useCallback(
    (id: string) =>
      change((current) => ({
        ...current,
        noteComments: current.noteComments?.filter(
          (comment) => comment.id !== id || comment.authorId !== profile.id,
        ),
      })),
    [change, profile.id],
  )
  return { comments, post, resolve, remove }
}
