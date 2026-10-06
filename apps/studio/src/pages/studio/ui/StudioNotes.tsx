import { useTranslation } from '@/shared/i18n/index.ts'
import { ArrowUpRight, NotebookPen } from 'lucide-react'

import type { StudioNotesProps } from '../types/studioNotesProps.ts'
export function StudioNotes({ workspace, change }: StudioNotesProps) {
  const { t } = useTranslation()

  return (
    <div className="content-page notes-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">{t('Keep the thinking together')}</div>
          <h1>{t('The idea behind Pomegranate.')}</h1>
          <p>
            {t(
              'Decisions, questions, and all the things that don’t fit in a box.',
            )}
          </p>
        </div>
        <NotebookPen size={30} strokeWidth={1.3} />
      </div>
      <div className="notes-layout">
        <textarea
          className="notes-editor"
          aria-label={t('Project notes')}
          value={workspace.notes}
          maxLength={50000}
          onChange={(e) => change((w) => ({ ...w, notes: e.target.value }))}
          spellCheck={false}
        />
        <aside className="notes-aside">
          <h3>{t('A living brief')}</h3>
          <p>
            {t(
              'Use this space for your product goals, open questions, and decisions. Plain text and Markdown are welcome.',
            )}
          </p>
          <div className="note-divider" />
          <h3>{t('Our starting point')}</h3>
          <p>
            {t(
              'Self-hosted, open-source deployment. A managed SaaS option. Reusable layers and operations that feel comfortable.',
            )}
          </p>
          <a href="https://pterodactyl.io/" target="_blank" rel="noreferrer">
            {t('Pterodactyl reference')}
            <ArrowUpRight size={14} />
          </a>
          <a
            href="https://www.youtube.com/@juxtopposed/videos"
            target="_blank"
            rel="noreferrer"
          >
            {t('Design inspiration')}
            <ArrowUpRight size={14} />
          </a>
          <div className="note-divider" />
          <small>
            {workspace.notes.length.toLocaleString()} {t('/ 50,000 characters')}
          </small>
        </aside>
      </div>
    </div>
  )
}
