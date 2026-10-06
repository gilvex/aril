import { ArrowUpRight, Play } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'

export function DemoEntry() {
  const { t } = useTranslation()
  return (
    <div className="demo-entry">
      <a
        className="button"
        href="/?demo=1&workspace=demo&board=layers&view=canvas"
      >
        <Play size={16} />
        <span>{t('Try demo')}</span>
        <ArrowUpRight size={16} />
      </a>
      <p>{t('No sign-in. A complete project you can edit and explore.')}</p>
    </div>
  )
}
