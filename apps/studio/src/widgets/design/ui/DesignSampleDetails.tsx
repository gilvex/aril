import { useTranslation } from '@/shared/i18n/index.ts'
import { Check, Users } from 'lucide-react'
export function DesignSampleDetails({ tab }: { tab: string }) {
  const { t } = useTranslation()
  const items =
    tab === 'Activity'
      ? [
          'Deployment batch completed · 3/3',
          'Game layer reused from cache',
          'Blueprint v1.2 published',
        ]
      : [
          'Alex · Project owner',
          'Sam · Server operator',
          'Taylor · Read-only observer',
        ]
  return (
    <div className="design-sample-events">
      {items.map((item, index) => (
        <div key={item}>
          {tab === 'Activity' ? <Check size={18} /> : <Users size={18} />}
          <span>
            <strong>{t(item)}</strong>
            <small>
              {tab === 'Activity'
                ? t('Sample event {{number}}', { number: index + 1 })
                : t('Access inherited from Weekend servers')}
            </small>
          </span>
        </div>
      ))}
    </div>
  )
}
