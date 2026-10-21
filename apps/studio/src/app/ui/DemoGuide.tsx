import { Text } from '@/shared/ui/Text.tsx'
import { Compass } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'

export function DemoGuide() {
  const { t } = useTranslation()
  const base = '/?demo=1&workspace=demo&board=layers'
  return (
    <details className="demo-guide">
      <Text as="summary">
        <Compass size={14} />
        {t('Explore features')}
      </Text>
      <nav aria-label={t('Demo guide')}>
        <a href={`${base}&view=canvas`}>
          <Text as="strong">{t('Blueprint')}</Text>
          <Text as="span">
            {t(
              'Edit nodes, link requirements, and move a group with Ctrl / Cmd.',
            )}
          </Text>
        </a>
        <a href={`${base}&view=requirements`}>
          <Text as="strong">{t('Requirements')}</Text>
          <Text as="span">
            {t('Try status and priority boards, filters, and bulk edits.')}
          </Text>
        </a>
        <a href={`${base}&view=design`}>
          <Text as="strong">{t('Design direction')}</Text>
          <Text as="span">
            {t('Compare colors, fonts, density, and mobile previews.')}
          </Text>
        </a>
        <a href={`${base}&view=notes`}>
          <Text as="strong">{t('Project notes')}</Text>
          <Text as="span">
            {t('Read the guide, edit Markdown, or add your own document.')}
          </Text>
        </a>
        <Text as="p">
          {t(
            'Open People to follow a simulated teammate. Try Undo, history, and export from workspace actions.',
          )}
        </Text>
      </nav>
    </details>
  )
}
