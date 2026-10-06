import { useCallback } from 'react'
import { FlaskConical, RotateCcw, LogOut } from 'lucide-react'
import { scopedDraftKey } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { demoStorageKey } from '../config/demoStorageKey.ts'
import { DemoGuide } from './DemoGuide.tsx'

export function DemoBanner() {
  const { t } = useTranslation()
  const reset = useCallback(() => {
    if (
      !confirm(
        t(
          'Reset this demo? Your demo edits will be removed. Real workspaces are not affected.',
        ),
      )
    )
      return
    sessionStorage.removeItem(demoStorageKey)
    sessionStorage.removeItem(scopedDraftKey('demo', 'demo-visitor'))
    localStorage.removeItem('pomegranate-studio-views:demo-visitor:demo')
    location.assign('/?demo=1&workspace=demo&board=layers&view=canvas')
  }, [t])
  return (
    <aside className="demo-banner" aria-label={t('Demo workspace')}>
      <span className="demo-banner-label">
        <FlaskConical size={16} />
        <strong>{t('Demo')}</strong>
        <span>{t('Saved in this tab · simulated teammates')}</span>
      </span>
      <div className="demo-banner-actions">
        <DemoGuide />
        <button onClick={reset} title={t('Reset demo')}>
          <RotateCcw size={14} />
          <span>{t('Reset demo')}</span>
        </button>
        <a href="/" title={t('Exit demo')}>
          <LogOut size={14} />
          <span>{t('Exit demo')}</span>
        </a>
      </div>
    </aside>
  )
}
