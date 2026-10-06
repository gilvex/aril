import { useTranslation } from '@/shared/i18n/index.ts'
import { LoadingStatus } from '@/shared/ui/index.tsx'
import type { InitialLoadingScreenProps } from '../types/initialLoadingScreenProps.ts'

export function InitialLoadingScreen({ loading }: InitialLoadingScreenProps) {
  const { t } = useTranslation()
  return (
    <div className="initial-loading" aria-hidden={!loading}>
      <img src="/aril.svg" alt="" width="48" height="48" />
      <strong>Aril</strong>
      <LoadingStatus label={t('Opening your shared workspace…')} />
    </div>
  )
}
