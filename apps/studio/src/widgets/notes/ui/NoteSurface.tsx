import { useCallback } from 'react'
import type { ChangeEvent } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useNoteSurface } from '../model/useNoteSurface.ts'
import type { NoteSurfaceProps } from '../types/noteSurfaceProps.ts'
import { NoteMarkdown } from './NoteMarkdown.tsx'

export function NoteSurface(props: NoteSurfaceProps) {
  const { t } = useTranslation()
  const { model, editor, surface } = props
  const live = useNoteSurface(props)
  const { blur: blurEditor } = editor
  const { clear } = live
  const blur = useCallback(() => {
    blurEditor()
    clear()
  }, [blurEditor, clear])
  const change = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) =>
      model.edit({ body: event.target.value }),
    [model],
  )
  return (
    <div className={`note-surface note-surface-${surface}`}>
      {surface === 'edit' ? (
        <textarea
          ref={editor.editor}
          className="notebook-input"
          aria-label={t('Note content')}
          value={model.note.body}
          placeholder={t('Write a note…')}
          maxLength={50000}
          onFocus={editor.focusBody}
          onBlur={blur}
          onChange={change}
          onSelect={live.select}
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
          onBlur={live.clear}
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
      <div
        ref={live.overlay}
        className="note-presence-overlay"
        aria-hidden="true"
      />
    </div>
  )
}
