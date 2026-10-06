import { useTranslation } from '@/shared/i18n/index.ts'
import { FileText, Search } from 'lucide-react'
import type { NoteListProps } from '../types/noteListProps.ts'
export function NoteList({
  documents,
  selected,
  query,
  patch,
  select,
  peers,
}: NoteListProps) {
  const { t } = useTranslation()
  return (
    <>
      <label className="notebook-search">
        <Search size={15} />
        <input
          aria-label={t('Search notes')}
          placeholder={t('Search notes')}
          value={query}
          onChange={(e) => patch({ query: e.target.value })}
        />
      </label>
      <div className="notebook-document-list">
        {documents.map((note) => (
          <button
            className={
              'notebook-document ' + (note.id === selected ? 'active' : '')
            }
            key={note.id}
            onClick={() => select(note.id)}
            aria-current={note.id === selected ? 'page' : undefined}
          >
            <FileText size={17} />
            <span>
              <strong>{note.title}</strong>
              <small>
                {note.body.replace(/[#*_]/g, '').trim().slice(0, 90) ||
                  t('Empty note')}
              </small>
            </span>
            {peers.some(
              (peer) =>
                peer.view === 'notes' &&
                peer.selected.includes('note:' + note.id),
            ) && (
              <i
                className="notebook-presence-dot"
                title={t('Someone is here')}
              />
            )}
          </button>
        ))}
        {!documents.length && (
          <p className="empty-message">{t('No matching notes')}</p>
        )}
      </div>
    </>
  )
}
