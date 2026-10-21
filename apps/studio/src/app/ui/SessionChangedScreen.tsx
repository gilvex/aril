import { Text } from '@/shared/ui/Text.tsx'
import { ProductLogo } from '@/shared/ui/index.tsx'
import { useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'

export function SessionChangedScreen() {
  const { t } = useTranslation()
  const reload = useCallback(() => location.replace('/app'), [])
  return (
    <main className="boot-screen">
      <ProductLogo />
      <Text as="h1">{t('Your account changed in another tab.')}</Text>
      <Text as="p">{t('Reload to continue with the current account.')}</Text>
      <button className="button primary" onClick={reload}>
        <Text>{t('Reload')}</Text>
      </button>
    </main>
  )
}
