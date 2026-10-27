import { Text } from '@/shared/ui/Text.tsx'
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
      <Text as="label" className="notebook-search">
        <Search size={15} />
        <input
          aria-label={t('Search notes')}
          placeholder={t('Search notes')}
          value={query}
          onChange={(e) => patch({ query: e.target.value })}
        />
      </Text>
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
            <Text as="span">
              <Text as="strong">{note.title}</Text>
              <Text as="small">
                {note.body.replace(/[#*_]/g, '').trim().slice(0, 90) ||
                  t('Empty note')}
              </Text>
            </Text>
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
          <Text as="p" className="empty-message">
            {t('No matching notes')}
          </Text>
        )}
      </div>
    </>
  )
}
