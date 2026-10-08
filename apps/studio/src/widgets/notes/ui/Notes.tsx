import { useTranslation } from '@/shared/i18n/index.ts'
import { PanelLeft, ListTree, Plus, X, MessageSquare } from 'lucide-react'
import type { NotesProps } from '../types/notesProps.ts'
import { useNotesModel } from '../model/useNotesModel.ts'
import { NoteList } from './NoteList.tsx'
import { NoteEditor } from './NoteEditor.tsx'
import '../notes.css'
export function Notes(props: NotesProps) {
  const { t } = useTranslation()
  const model = useNotesModel(props)
  const { state, patch, note } = model
  return (
    <section className="notebook">
      <header className="notebook-toolbar">
        <button
          className="icon-button"
          aria-label={t('Documents')}
          aria-expanded={state.list}
          onClick={() => patch({ list: !state.list })}
        >
          <PanelLeft size={18} />
        </button>
        <h1>
          {t('Notes')} <span>{model.documents.length}</span>
        </h1>
        <div className="segmented" aria-label={t('Reading mode')}>
          {(['Edit', 'Split', 'Read'] as const).map((mode) => (
            <button
              key={mode}
              aria-pressed={state.mode === mode}
              className={state.mode === mode ? 'active' : ''}
              onClick={() => patch({ mode })}
            >
              {t(mode)}
            </button>
          ))}
        </div>
        <button
          className="button subtle notebook-outline-toggle"
          aria-expanded={state.outline}
          onClick={() => patch({ outline: !state.outline, comments: false })}
        >
          <ListTree size={16} />
          {t('Outline')}
        </button>
        <button
          className="button subtle"
          aria-expanded={state.comments}
          onClick={() => patch({ comments: !state.comments, outline: false })}
        >
          <MessageSquare size={16} />
          {t('Comments')}
        </button>
        <button
          className="button primary"
          onClick={model.create}
          disabled={model.documents.length >= 51}
        >
          <Plus size={16} />
          {t('New note')}
        </button>
      </header>
      <div className="notebook-layout">
        {state.list && (
          <>
            <button
              className="notebook-scrim"
              aria-label={t('Close documents')}
              onClick={() => patch({ list: false })}
            />
            <aside className="notebook-documents">
              <div className="notebook-panel-heading">
                <strong>{t('Documents')}</strong>
                <button
                  className="icon-button"
                  aria-label={t('Close documents')}
                  onClick={() => patch({ list: false })}
                >
                  <X size={16} />
                </button>
              </div>
              <NoteList
                documents={model.visible}
                selected={note.id}
                query={state.query}
                patch={patch}
                select={model.select}
                peers={props.peers}
              />
            </aside>
          </>
        )}
        <NoteEditor
          key={note.id}
          model={model}
          workspace={props.workspace}
          peers={props.peers}
          workspaceId={props.workspaceId}
        />
      </div>
    </section>
  )
}
