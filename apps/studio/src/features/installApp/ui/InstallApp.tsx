import { Download } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import './installApp.css'

export function InstallApp() {
  const { t } = useTranslation()
  return (
    <details className="install-app">
      <summary>
        <Download size={16} />
        {t('Install app')}
      </summary>
      <p>
        {t(
          'Use your browser’s Install app or Add to Home Screen option. On iPhone or iPad, open Share → Add to Home Screen.',
        )}
      </p>
      <p>
        {t(
          'An internet connection is needed to open and sync your workspaces.',
        )}
      </p>
    </details>
  )
}
