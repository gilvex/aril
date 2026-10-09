import { CodeXml, Globe, ArrowUpRight } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { projectLinks } from '../config/projectLinks.ts'
import { useTranslation } from '../i18n/index.ts'
import './projectLinks.css'

export function ProjectLinks() {
  const { t } = useTranslation()
  return (
    <nav className="project-links" aria-label={t('About Aril')}>
      <Button asChild variant="ghost" size="sm">
        <a
          href={projectLinks.repository}
          target="_blank"
          rel="noopener noreferrer"
        >
          <CodeXml size={16} aria-hidden="true" />
          {t('GitHub')}
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <a
          href={projectLinks.website}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Globe size={16} aria-hidden="true" />
          {t('Creator’s website')}
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </Button>
    </nav>
  )
}
