import { CodeXml } from 'lucide-react'
import { projectLinks } from '../config/projectLinks.ts'
import { useTranslation } from '../i18n/index.ts'
import './sourceCodeLink.css'

export function SourceCodeLink() {
  const { t } = useTranslation()
  return (
    <a
      className="source-code-link"
      href={projectLinks.repository}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('Source code on GitHub')}
      title={t('Source code on GitHub')}
    >
      <CodeXml size={14} aria-hidden="true" />
      <span>{t('Source code')}</span>
    </a>
  )
}
