import { Text } from '@/shared/ui/Text.tsx'
import { Download } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import './installApp.css'

export function InstallApp() {
  const { t } = useTranslation()
  return (
    <details className="install-app">
      <Text as="summary">
        <Download size={16} />
        {t('Install app')}
      </Text>
      <Text as="p">
        {t(
          'Use your browser’s Install app or Add to Home Screen option. On iPhone or iPad, open Share → Add to Home Screen.',
        )}
      </Text>
      <Text as="p">
        {t(
          'An internet connection is needed to open and sync your workspaces.',
        )}
      </Text>
    </details>
  )
}
