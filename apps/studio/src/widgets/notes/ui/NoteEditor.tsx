import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { Trash2 } from 'lucide-react'
import type { NoteEditorProps } from '../types/noteEditorProps.ts'
import { useNoteEditor } from '../model/useNoteEditor.ts'
import { NoteFormatBar } from './NoteFormatBar.tsx'
import { NoteViewer } from './NoteViewer.tsx'
import { NoteOutline } from './NoteOutline.tsx'
import { NoteSurface } from './NoteSurface.tsx'
import { NoteCommentsPanel } from './NoteCommentsPanel.tsx'
export function NoteEditor(props: NoteEditorProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const { model, workspace, peers } = props
  const { note, state, patch } = model
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
            readOnly={readOnly}
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
            disabled={readOnly || note.id === 'project-notes'}
            onClick={() => patch({ deleting: true })}
          >
            <Trash2 size={16} />
          </button>
        </header>
        {!!viewers.length && (
          <div className="notebook-viewers" aria-live="polite">
            {viewers.map((peer) => (
              <NoteViewer key={peer.clientId} peer={peer} />
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
        {!readOnly && state.mode !== 'Read' && (
          <NoteFormatBar
            format={editor.format}
            insertLink={editor.insertLink}
            workspace={workspace}
          />
        )}
        <div className={'notebook-content mode-' + state.mode.toLowerCase()}>
          {!readOnly && state.mode !== 'Read' && (
            <NoteSurface
              model={model}
              editor={editor}
              peers={peers}
              surface="edit"
            />
          )}
          {(readOnly || state.mode !== 'Edit') && (
            <NoteSurface
              model={model}
              editor={editor}
              peers={peers}
              surface="read"
            />
          )}
        </div>
        <footer className="notebook-meta">
          <span>{t('Markdown supported')}</span>
          <span>{note.body.length.toLocaleString()} / 50,000</span>
        </footer>
      </article>
      {state.comments && <NoteCommentsPanel {...props} />}
      {state.outline && (
        <NoteOutline editor={editor} close={() => patch({ outline: false })} />
      )}
    </>
  )
}
