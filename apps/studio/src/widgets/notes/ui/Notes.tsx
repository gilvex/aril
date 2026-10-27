import { Text } from '@/shared/ui/Text.tsx'
import { useCallback } from 'react'
import { ToggleGroup, ToggleGroupItem } from 'vagabond-ui/toggle-group'
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
  const selectMode = useCallback(
    (value: string) => {
      if (value === 'Edit' || value === 'Split' || value === 'Read')
        patch({ mode: value })
    },
    [patch],
  )
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
        <Text as="h1">
          {t('Notes')} <Text as="span">{model.documents.length}</Text>
        </Text>
        <ToggleGroup
          data-studio-toggle-group
          type="single"
          value={state.mode}
          onValueChange={selectMode}
          className="notes-reading-mode"
          aria-label={t('Reading mode')}
        >
          {(['Edit', 'Split', 'Read'] as const).map((mode) => (
            <ToggleGroupItem key={mode} value={mode}>
              <Text>{t(mode)}</Text>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <button
          className="button subtle notebook-outline-toggle"
          aria-expanded={state.outline}
          onClick={() => patch({ outline: !state.outline, comments: false })}
        >
          <ListTree size={16} />
          <Text>{t('Outline')}</Text>
        </button>
        <button
          className="button subtle"
          aria-expanded={state.comments}
          onClick={() => patch({ comments: !state.comments, outline: false })}
        >
          <MessageSquare size={16} />
          <Text>{t('Comments')}</Text>
        </button>
        <button
          className="button primary"
          onClick={model.create}
          disabled={model.documents.length >= 51}
        >
          <Plus size={16} />
          <Text>{t('New note')}</Text>
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
                <Text as="strong">{t('Documents')}</Text>
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
