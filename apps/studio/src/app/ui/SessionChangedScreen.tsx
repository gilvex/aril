import { useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'

export function SessionChangedScreen() {
  const { t } = useTranslation()
  const reload = useCallback(() => location.replace('/'), [])
  return (
    <main className="boot-screen">
      <img src="/mark.svg" alt="" />
      <h1>{t('Your account changed in another tab.')}</h1>
      <p>{t('Reload to continue with the current account.')}</p>
      <button className="button primary" onClick={reload}>
        {t('Reload')}
      </button>
    </main>
  )
}
