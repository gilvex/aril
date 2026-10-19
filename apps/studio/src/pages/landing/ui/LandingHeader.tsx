import { getProductBranding } from '@/shared/deploymentSettings/index.ts'
import { ProductLogo } from '@/shared/ui/index.tsx'
import { ArrowUpRight } from 'lucide-react'
import { LanguagePicker } from '@/features/appearance/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'

export function LandingHeader() {
  const { t } = useTranslation()
  return (
    <header className="landing-header">
      <a
        className="landing-brand"
        href="#top"
        aria-label={t('{{product}} home', {
          product: getProductBranding().productName,
        })}
      >
        <ProductLogo width="30" height="30" />
        <span>{getProductBranding().productName}</span>
      </a>
      <nav className="landing-navigation" aria-label={t('About Aril')}>
        <a href="#studio">{t('Explore the studio')}</a>
        <a href="/changelog">{t('Updates')}</a>
        <a
          href="https://github.com/gilvex/aril"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('GitHub')} <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      </nav>
      <div className="landing-header-actions">
        <LanguagePicker />
        <a className="landing-button landing-button-small" href="#access">
          {t('Sign in')}
        </a>
      </div>
    </header>
  )
}
