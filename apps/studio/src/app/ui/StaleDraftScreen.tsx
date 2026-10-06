import { downloadJson } from '@/shared/api/downloadJson.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useStaleDraftScreenHandlers } from '../model/useStaleDraftScreenHandlers.tsx'

import type { StaleDraftScreenProps } from '../types/staleDraftScreenProps.ts'
export function StaleDraftScreen({
  legacy,
  staleDraftKey,
  setStaleDraftKey,
  setRecovery,
  setInitial,
  setLegacy,
  studio,
  setError,
}: StaleDraftScreenProps) {
  const { t } = useTranslation()

  const { handleClick } = useStaleDraftScreenHandlers({
    staleDraftKey,
    setStaleDraftKey,
    setRecovery,
    setInitial,
    setLegacy,
    studio,
    setError,
  })
  return (
    <div className="boot-screen">
      <img src="/aril.svg" alt="" />
      <h1>{t('This draft is out of date.')}</h1>
      <p>
        {t(
          'These edits came from an older page or saved revision and have not been applied. Download a copy if you need them, then open the latest shared workspace.',
        )}
      </p>
      <textarea
        className="legacy-json"
        aria-label={t('Recovery draft JSON')}
        readOnly
        value={JSON.stringify(legacy, null, 2)}
        onFocus={(event) => event.target.select()}
      />
      <div className="modal-actions">
        <button
          className="button"
          onClick={() => downloadJson(legacy, 'pomegranate-recovery.json')}
        >
          {t('Download draft')}
        </button>
        <button className="button primary" onClick={handleClick}>
          {t('Continue with saved workspace')}
        </button>
      </div>
    </div>
  )
}
