import { Text } from '@/shared/ui/Text.tsx'
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
        <Text as="span">{getProductBranding().productName}</Text>
      </a>
      <nav className="landing-navigation" aria-label={t('About Aril')}>
        <a href="#studio">
          <Text>{t('Explore the studio')}</Text>
        </a>
        <a href="/changelog">
          <Text>{t('Updates')}</Text>
        </a>
        <a
          href="https://github.com/gilvex/aril"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Text>{t('GitHub')}</Text><Text>{' '}</Text>
          <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      </nav>
      <div className="landing-header-actions">
        <LanguagePicker />
        <a className="landing-button landing-button-small" href="/app">
          <Text>{t('Sign in')}</Text>
        </a>
      </div>
    </header>
  )
}
