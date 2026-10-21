import { Text } from '@/shared/ui/Text.tsx'
import { ProductLogo } from '@/shared/ui/index.tsx'
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
      <ProductLogo />
      <Text as="h1">{t('This draft is out of date.')}</Text>
      <Text as="p">
        {t(
          'These edits came from an older page or saved revision and have not been applied. Download a copy if you need them, then open the latest shared workspace.',
        )}
      </Text>
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
          <Text>{t('Download draft')}</Text>
        </button>
        <button className="button primary" onClick={handleClick}>
          <Text>{t('Continue with saved workspace')}</Text>
        </button>
      </div>
    </div>
  )
}
