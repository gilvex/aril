import { useTranslation } from '@/shared/i18n/index.ts'
import { LoadingProgress, LoadingStatus } from '@/shared/ui/index.tsx'
import type { InitialLoadingScreenProps } from '../types/initialLoadingScreenProps.ts'

export function InitialLoadingScreen({
  loading,
  completed,
  total,
}: InitialLoadingScreenProps) {
  const { t } = useTranslation()
  const label = !loading
    ? t('Ready')
    : completed === 0
      ? t('Checking your session…')
      : completed === 1
        ? t('Finding your workspace…')
        : t('Loading your workspace…')
  return (
    <div className="initial-loading" aria-hidden={!loading}>
      <img src="/aril.svg" alt="" width="48" height="48" />
      <strong>Aril</strong>
      {total > 1 ? (
        <LoadingProgress
          label={label}
          completed={loading ? completed : total}
          total={total}
        />
      ) : (
        <LoadingStatus label={label} />
      )}
    </div>
  )
}
