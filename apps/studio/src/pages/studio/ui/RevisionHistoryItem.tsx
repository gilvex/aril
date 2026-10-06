import { useTranslation } from '@/shared/i18n/index.ts'
import { RotateCcw } from 'lucide-react'
import { useRevisionHistoryItemHandlers } from '../model/useRevisionHistoryItemHandlers.tsx'

import type { RevisionHistoryItemProps } from '../types/revisionHistoryItemProps.ts'
export function RevisionHistoryItem({
  s,
  studio,
  state,
  change,
  setModal,
  setNotice,
}: RevisionHistoryItemProps) {
  const { t } = useTranslation()

  const { handleClick } = useRevisionHistoryItemHandlers({
    s,
    studio,
    state,
    change,
    setModal,
    setNotice,
  })
  return (
    <button
      className="button"
      aria-label={t('Restore revision {{revision}}', { revision: s.revision })}
      onClick={handleClick}
    >
      <RotateCcw size={14} />
      {t('Restore')}
    </button>
  )
}
