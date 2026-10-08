import type { SelectChange } from '@/shared/types/selectChange.ts'
import { useRef, useMemo, useCallback } from 'react'
import type { ChangeEvent } from 'react'
import type { NoteEditorProps } from '../types/noteEditorProps.ts'
import { formatNote } from '../utils/formatNote.ts'
import { noteHeadings } from '../utils/noteHeadings.ts'
export function useNoteEditor({ model, workspaceId }: NoteEditorProps) {
  const editor = useRef<HTMLTextAreaElement>(null)
  const reader = useRef<HTMLDivElement>(null)
  const { note, edit, state, presence, patch } = model
  const headings = useMemo(() => noteHeadings(note.body), [note.body])
  const format = useCallback(
    (kind: string) => {
      const area = editor.current
      if (!area) return
      const result = formatNote(
        note.body,
        area.selectionStart,
        area.selectionEnd,
        kind,
      )
      if (result.body.length > 50000) return
      edit({ body: result.body })
      requestAnimationFrame(() => {
        area.focus()
        area.setSelectionRange(result.start, result.end)
      })
    },
    [note.body, edit],
  )
  const insertLink = useCallback(
    (event: SelectChange) => {
      const value = event.target.value
      if (!value || !editor.current) return
      const [kind, id, title] = JSON.parse(value) as string[]
      const route = new URLSearchParams({
        workspace: workspaceId,
        view: kind === 'board' ? 'canvas' : 'requirements',
        [kind === 'board' ? 'board' : 'requirement']: id,
      })
      const label = title.split('[').join('\\[').split(']').join('\\]')
      const text = '[' + label + '](?' + route + ')'
      const area = editor.current
      const body =
        note.body.slice(0, area.selectionStart) +
        text +
        note.body.slice(area.selectionEnd)
      if (body.length <= 50000) edit({ body })
      requestAnimationFrame(() => area.focus())
    },
    [workspaceId, note.body, edit],
  )
  const jump = useCallback(
    (line: number) => {
      if (state.mode !== 'Edit')
        reader.current
          ?.querySelector('[data-line="' + line + '"]')
          ?.scrollIntoView({ block: 'start', behavior: 'instant' })
      else if (editor.current) {
        const offset = note.body
          .split('\n')
          .slice(0, line - 1)
          .reduce((sum, part) => sum + part.length + 1, 0)
        editor.current.focus()
        editor.current.setSelectionRange(offset, offset)
        editor.current.scrollTop = (line - 1) * 26
      }
    },
    [note.body, state.mode],
  )
  const focusBody = useCallback(() => presence('body'), [presence])
  const focusTitle = useCallback(() => presence('title'), [presence])
  const blur = useCallback(() => presence(), [presence])
  const rename = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      patch({ titleDraft: e.target.value })
      if (e.target.value.trim()) edit({ title: e.target.value })
    },
    [patch, edit],
  )
  const blurTitle = useCallback(() => {
    patch({ titleDraft: null })
    presence()
  }, [patch, presence])
  return {
    rename,
    blurTitle,
    editor,
    reader,
    headings,
    format,
    insertLink,
    jump,
    focusBody,
    focusTitle,
    blur,
  }
}
