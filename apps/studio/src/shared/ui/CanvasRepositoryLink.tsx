import { Panel } from '@xyflow/react'
import { CodeXml } from 'lucide-react'
import { projectLinks } from '../config/projectLinks.ts'
import { useTranslation } from '../i18n/index.ts'
import './canvasRepositoryLink.css'

export function CanvasRepositoryLink() {
  const { t } = useTranslation()
  return (
    <Panel position="bottom-right" className="canvas-repository-link">
      <a
        href={projectLinks.repository}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('Aril on GitHub')}
        title={t('Aril on GitHub')}
      >
        <CodeXml size={12} aria-hidden="true" />
        {t('GitHub')}
      </a>
    </Panel>
  )
}
