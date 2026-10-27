import { ChangelogMedia } from './ChangelogMedia.tsx'
import { ArrowUpRight, Link } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { useTranslation } from '@/shared/i18n/index.ts'
import { projectLinks } from '@/shared/config/projectLinks.ts'
import type { ReleaseEntry } from '../types/releaseEntry.ts'

export function ChangelogEntry({ entry }: { entry: ReleaseEntry }) {
  const { t, i18n } = useTranslation()
  const date = new Date(`${entry.date}T12:00:00Z`).toLocaleDateString(
    i18n.language,
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    },
  )
  return (
    <article
      className="changelog-entry"
      id={entry.id}
      aria-labelledby={`${entry.id}-title`}
    >
      <div className="changelog-date">
        <time dateTime={entry.date}>{date}</time>
      </div>
      <div className="changelog-entry-content">
        <header>
          <h2 id={`${entry.id}-title`}>{t(entry.title)}</h2>
          <Button asChild variant="ghost" size="icon">
            <a
              href={`#${entry.id}`}
              aria-label={t('Link to this update')}
              title={t('Link to this update')}
            >
              <Link size={16} />
            </a>
          </Button>
        </header>
        <p className="changelog-summary">{t(entry.summary)}</p>
        <ChangelogMedia entry={entry} />
        <ul>
          {entry.changes.map((change) => (
            <li key={change}>{t(change)}</li>
          ))}
        </ul>
        {entry.commit && (
          <Button asChild variant="ghost" size="sm">
            <a
              href={`${projectLinks.repository}/commit/${entry.commit}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('View code')}
              <ArrowUpRight size={14} />
            </a>
          </Button>
        )}
      </div>
    </article>
  )
}
