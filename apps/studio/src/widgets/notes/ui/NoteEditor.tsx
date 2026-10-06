import { useTranslation } from '@/shared/i18n/index.ts'
import { Trash2 } from 'lucide-react'
import type { NoteEditorProps } from '../types/noteEditorProps.ts'
import { useNoteEditor } from '../model/useNoteEditor.ts'
import { NoteFormatBar } from './NoteFormatBar.tsx'
import { NoteOutline } from './NoteOutline.tsx'
import { NoteMarkdown } from './NoteMarkdown.tsx'
export function NoteEditor(props: NoteEditorProps) {
  const { t } = useTranslation()
  const { model, workspace, peers } = props
  const { note, state, patch, edit } = model
  const editor = useNoteEditor(props)
  const viewers = peers.filter(
    (peer) =>
      peer.view === 'notes' && peer.selected.includes('note:' + note.id),
  )
  return (
    <>
      <article className="notebook-sheet">
        <header className="notebook-title">
          <input
            aria-label={t('Note title')}
            value={state.titleDraft ?? note.title}
            maxLength={120}
            onFocus={editor.focusTitle}
            onBlur={editor.blurTitle}
            onChange={editor.rename}
          />
          <button
            className="icon-button"
            aria-label={t('Delete note')}
            title={
              note.id === 'project-notes'
                ? t('Original project notes are kept')
                : t('Delete note')
            }
            disabled={note.id === 'project-notes'}
            onClick={() => patch({ deleting: true })}
          >
            <Trash2 size={16} />
          </button>
        </header>
        {!!viewers.length && (
          <div className="notebook-viewers" aria-live="polite">
            {viewers.map((peer) => (
              <span
                key={peer.clientId}
                style={{ borderColor: peer.profile.color }}
              >
                {peer.profile.name} ·{' '}
                {peer.selected.includes('note-field:body') ||
                peer.selected.includes('note-field:title')
                  ? t('Editing')
                  : t('Viewing')}
              </span>
            ))}
          </div>
        )}
        {state.deleting && (
          <div className="notebook-delete" role="alert">
            <span>{t('Delete this note? You can undo this change.')}</span>
            <button
              className="button"
              onClick={() => patch({ deleting: false })}
            >
              {t('Cancel')}
            </button>
            <button className="button danger" onClick={model.remove}>
              {t('Delete')}
            </button>
          </div>
        )}
        {state.mode !== 'Read' && (
          <NoteFormatBar
            format={editor.format}
            insertLink={editor.insertLink}
            workspace={workspace}
          />
        )}
        <div className={'notebook-content mode-' + state.mode.toLowerCase()}>
          {state.mode !== 'Read' && (
            <textarea
              ref={editor.editor}
              className="notebook-input"
              aria-label={t('Note content')}
              value={note.body}
              placeholder={t('Write a note…')}
              maxLength={50000}
              onFocus={editor.focusBody}
              onBlur={editor.blur}
              onChange={(e) => edit({ body: e.target.value })}
            />
          )}
          {state.mode !== 'Edit' && (
            <div ref={editor.reader} className="notebook-reading">
              <NoteMarkdown body={note.body} />
              {!note.body && <p className="empty-message">{t('Empty note')}</p>}
            </div>
          )}
        </div>
        <footer className="notebook-meta">
          <span>{t('Markdown supported')}</span>
          <span>{note.body.length.toLocaleString()} / 50,000</span>
        </footer>
      </article>
      {state.outline && (
        <NoteOutline editor={editor} close={() => patch({ outline: false })} />
      )}
    </>
  )
}
