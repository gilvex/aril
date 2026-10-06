import { configureStore } from '@reduxjs/toolkit'
import {
  useEffect,
  useRef,
  useSyncExternalStore,
  useCallback,
  useMemo,
} from 'react'
import { notesSlice } from './slices/notesSlice.ts'
import type { NotesState } from '../types/notesState.ts'
import type { NotesProps } from '../types/notesProps.ts'
import { noteDocuments } from '../utils/noteDocuments.ts'
import { updateNote } from '../utils/updateNote.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
export function useNotesModel(props: NotesProps) {
  const { t } = useTranslation()
  const { workspace, change, workspaceId, profileId, sendPresence, followed } =
    props
  const key = `pomegranate-notebook:${profileId}:${workspaceId}`
  const ref = useRef<ReturnType<typeof configureStore<NotesState>> | null>(null)
  if (!ref.current) {
    let selected = 'project-notes'
    try {
      selected = localStorage.getItem(key) || selected
    } catch {
      /* storage unavailable */
    }
    ref.current = configureStore({
      reducer: notesSlice.reducer,
      preloadedState: {
        ...notesSlice.getInitialState(),
        list: window.innerWidth >= 800,
        selected,
      },
      devTools: false,
    })
  }
  const store = ref.current
  const state = useSyncExternalStore(store.subscribe, store.getState)
  const patch = useCallback(
    (value: Partial<NotesState>) => {
      store.dispatch(notesSlice.actions.patch(value))
    },
    [store],
  )
  const documents = useMemo(
    () => noteDocuments(workspace, t('Project notes')),
    [workspace, t],
  )
  const note =
    documents.find((entry) => entry.id === state.selected) || documents[0]
  useEffect(() => {
    patch({ titleDraft: null })
  }, [note.id, patch])
  const visible = useMemo(
    () =>
      documents.filter((entry) =>
        `${entry.title} ${entry.body}`
          .toLocaleLowerCase()
          .includes(state.query.toLocaleLowerCase()),
      ),
    [documents, state.query],
  )
  useEffect(() => {
    try {
      localStorage.setItem(key, note.id)
    } catch {
      /* storage unavailable */
    }
  }, [key, note.id])
  useEffect(() => {
    sendPresence({ selected: [`note:${note.id}`] }, true)
    return () => sendPresence({ selected: [] }, true)
  }, [sendPresence, note.id])
  useEffect(() => {
    const target =
      followed?.view === 'notes'
        ? followed.selected.find((id) => id.startsWith('note:'))?.slice(5)
        : null
    if (target && documents.some((entry) => entry.id === target))
      patch({ selected: target, deleting: false })
  }, [followed, documents, patch])
  const edit = useCallback(
    (value: Partial<Pick<typeof note, 'title' | 'body'>>) =>
      change((w) => updateNote(w, note.id, value)),
    [change, note.id],
  )
  const select = useCallback(
    (id: string) =>
      patch({
        selected: id,
        titleDraft: null,
        deleting: false,
        ...(window.innerWidth < 800 ? { list: false } : {}),
      }),
    [patch],
  )
  const create = useCallback(() => {
    if ((workspace.documents?.length || 0) >= 50) return
    const id = crypto.randomUUID()
    change((w) => ({
      ...w,
      documents: [
        ...(w.documents || []),
        { id, title: t('Untitled note'), body: '' },
      ],
    }))
    patch({
      selected: id,
      mode: 'Edit',
      deleting: false,
      query: '',
      ...(window.innerWidth < 800 ? { list: false } : {}),
    })
  }, [change, patch, t, workspace.documents?.length])
  const remove = useCallback(() => {
    if (note.id === 'project-notes') return
    change((w) => ({
      ...w,
      documents: w.documents?.filter((entry) => entry.id !== note.id),
    }))
    patch({ selected: 'project-notes', titleDraft: null, deleting: false })
  }, [change, note.id, patch])
  const presence = useCallback(
    (field?: string) =>
      sendPresence({
        selected: [
          `note:${note.id}`,
          ...(field ? [`note-field:${field}`] : []),
        ],
      }),
    [note.id, sendPresence],
  )
  return {
    state,
    patch,
    documents,
    note,
    visible,
    edit,
    select,
    create,
    remove,
    presence,
  }
}
