import { useCallback, useEffect, useMemo } from 'react'
import {
  mergeNoteText,
  noteTextSnapshot,
  readNoteText,
  writeNoteText,
  noteTextDelta,
  noteTextVector,
  noteTextMissing,
} from '@pomegranate/domain/noteText'
import { noteBodyKey } from '../utils/noteBodyKey.ts'
import type { LiveNoteProps } from '../types/liveNoteProps.ts'
export function useLiveNote({
  note,
  workspace,
  changeText,
  noteText,
  canEdit,
  patch,
  getState,
}: LiveNoteProps) {
  const id = note.id
  const saved = useMemo(() => noteTextSnapshot(workspace, id)!, [workspace, id])
  useEffect(() => {
    const live = getState().liveText[id]
    const next = live?.seed === saved.seed ? mergeNoteText(live, saved) : saved
    if (live?.seed !== next.seed || live?.update !== next.update) {
      patch({ liveText: { ...getState().liveText, [id]: next } })
      if (canEdit && live?.seed === next.seed)
        noteText.send({
          kind: 'delta',
          id,
          seedKey: noteBodyKey(next.seed),
          update: noteTextDelta(live, next),
        })
    }
  }, [saved, id, patch, getState, canEdit, noteText])
  useEffect(() => {
    const request = () => {
      const current = getState().liveText[id]
      noteText.send({
        kind: 'sync',
        id,
        ...(current
          ? {
              seedKey: noteBodyKey(current.seed),
              vector: noteTextVector(current),
            }
          : {}),
      })
    }
    const stop = noteText.subscribe((message) => {
      if (message.id !== id) return
      const current = getState().liveText[id]
      if (!current) return
      try {
        if (message.kind === 'sync') {
          if (canEdit) {
            if (message.vector && message.seedKey === noteBodyKey(current.seed))
              noteText.send({
                kind: 'delta',
                id,
                seedKey: message.seedKey,
                update: noteTextMissing(current, message.vector),
              })
            else noteText.send({ kind: 'snapshot', id, state: current })
          }
          return
        }
        const incoming =
          message.kind === 'snapshot'
            ? message.state
            : { seed: current.seed, update: message.update }
        if (
          (message.kind === 'delta' &&
            message.seedKey !== noteBodyKey(current.seed)) ||
          incoming.seed !== current.seed
        ) {
          return
        }
        const merged = mergeNoteText(current, incoming)
        if (merged.update !== current.update)
          patch({ liveText: { ...getState().liveText, [id]: merged } })
      } catch {
        // Ignore invalid packets; the next bounded state exchange repairs gaps.
      }
    })
    request()
    // Periodic state exchange repairs missed/out-of-order packets and reconnects.
    const timer = setInterval(request, 5000)
    return () => {
      stop()
      clearInterval(timer)
    }
  }, [id, noteText, canEdit, getState, patch])
  const editBody = useCallback(
    (
      body: string,
      base?: import('@pomegranate/domain/noteText').NoteTextState,
    ) => {
      if (!canEdit) return
      const before = getState().liveText[id] || saved
      const next = mergeNoteText(before, writeNoteText(base || before, body))
      changeText(id, before, next)
      patch({ liveText: { ...getState().liveText, [id]: next } })
      noteText.send({
        kind: 'delta',
        id,
        seedKey: noteBodyKey(next.seed),
        update: noteTextDelta(before, next),
      })
    },
    [canEdit, getState, id, saved, changeText, patch, noteText],
  )
  const live = getState().liveText[id]
  return {
    textState: live?.seed === saved.seed ? live : saved,
    body: readNoteText(live?.seed === saved.seed ? live : saved),
    editBody,
  }
}
