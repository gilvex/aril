import { Compass } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'

export function DemoGuide() {
  const { t } = useTranslation()
  const base = '/?demo=1&workspace=demo&board=layers'
  return (
    <details className="demo-guide">
      <summary>
        <Compass size={14} />
        {t('Explore features')}
      </summary>
      <nav aria-label={t('Demo guide')}>
        <a href={`${base}&view=canvas`}>
          <strong>{t('Blueprint')}</strong>
          <span>
            {t(
              'Edit nodes, link requirements, and move a group with Ctrl / Cmd.',
            )}
          </span>
        </a>
        <a href={`${base}&view=canvas&canvas=wireframes`}>
          <strong>{t('Wireframes')}</strong>
          <span>
            {t(
              'Explore six connected screens. Use Preview flow to click through.',
            )}
          </span>
        </a>
        <a href={`${base}&view=requirements`}>
          <strong>{t('Requirements')}</strong>
          <span>
            {t('Try status and priority boards, filters, and bulk edits.')}
          </span>
        </a>
        <a href={`${base}&view=design`}>
          <strong>{t('Design direction')}</strong>
          <span>
            {t('Compare colors, fonts, density, and mobile previews.')}
          </span>
        </a>
        <a href={`${base}&view=notes`}>
          <strong>{t('Project notes')}</strong>
          <span>
            {t('Read the guide, edit Markdown, or add your own document.')}
          </span>
        </a>
        <p>
          {t(
            'Open People to follow a simulated teammate. Try Undo, history, and export from workspace actions.',
          )}
        </p>
      </nav>
    </details>
  )
}
