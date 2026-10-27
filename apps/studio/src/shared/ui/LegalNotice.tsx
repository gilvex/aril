import { useTranslation } from '../i18n/index.ts'
import './legalNotice.css'

export function LegalNotice() {
  const { t } = useTranslation()
  return (
    <aside className="legal-notice" aria-label={t('Legal & privacy')}>
      <p>
        {t(
          'Before sharing your work, read how Aril handles accounts, collaboration and data. Hosted-service policies are currently drafts for review.',
        )}
      </p>
      <nav aria-label={t('Sign-in legal information')}>
        <a href="/legal/terms" target="_blank" rel="noopener noreferrer">
          {t('Terms of service')}
        </a>
        <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">
          {t('Privacy notice')}
        </a>
        <a href="/legal/storage" target="_blank" rel="noopener noreferrer">
          {t('Cookies & storage')}
        </a>
      </nav>
    </aside>
  )
}
