import { useNoteInput } from '../model/useNoteInput.ts'
import { useNoteCaret } from '../model/useNoteCaret.ts'
import { useCallback } from 'react'
import type { FocusEvent } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useNoteSurface } from '../model/useNoteSurface.ts'
import type { NoteSurfaceProps } from '../types/noteSurfaceProps.ts'
import { NoteCursors } from './NoteCursors.tsx'
import { NoteMarkdown } from './NoteMarkdown.tsx'

export function NoteSurface(props: NoteSurfaceProps) {
  const { t } = useTranslation()
  const { model, editor, surface } = props
  const live = useNoteSurface(props)
  const caret = useNoteCaret(props)
  const input = useNoteInput(props, caret.beforeInput)
  const { blur: blurEditor } = editor
  const { clear } = live
  const blur = useCallback(
    (event: FocusEvent) => {
      if (
        (event.relatedTarget as Element | null)?.closest(
          '[data-follow-controls]',
        )
      )
        return
      blurEditor()
      clear()
    },
    [blurEditor, clear],
  )
  const select = useCallback(() => {
    caret.capture()
    live.select()
  }, [caret, live])
  return (
    <div className={`note-surface note-surface-${surface}`}>
      {surface === 'edit' ? (
        <textarea
          ref={editor.editor}
          className="notebook-input"
          aria-label={t('Note content')}
          value={input.value}
          placeholder={t('Write a note…')}
          maxLength={50000}
          onFocus={editor.focusBody}
          onBlur={blur}
          onChange={input.change}
          onCompositionStart={input.compositionStart}
          onCompositionEnd={input.compositionEnd}
          onSelect={select}
          onPointerMove={live.publish}
          onPointerLeave={live.select}
        />
      ) : (
        <div
          ref={editor.reader}
          className="notebook-reading"
          tabIndex={0}
          onPointerMove={live.publish}
          onPointerUp={live.select}
          onKeyUp={live.select}
          onPointerLeave={live.select}
          onBlur={blur}
        >
          <NoteMarkdown body={model.note.body} />
          {!model.note.body && (
            <p className="empty-message">{t('Empty note')}</p>
          )}
        </div>
      )}
      {surface === 'edit' && (
        <div
          ref={live.mirror}
          className="note-text-mirror"
          aria-hidden="true"
        />
      )}
      <NoteCursors {...props} />
      <div
        ref={live.overlay}
        className="note-presence-overlay"
        aria-hidden="true"
      />
    </div>
  )
}
