import { Text } from '@/shared/ui/Text.tsx'
import { getProductBranding } from '@/shared/deploymentSettings/index.ts'
import { ProductLogo } from '@/shared/ui/index.tsx'
import { ThemePicker } from '@/features/appearance/index.ts'
import { InstallApp } from '@/features/installApp/index.ts'
import { ProjectLinks } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { LandingHeader } from './LandingHeader.tsx'
import { LandingHero } from './LandingHero.tsx'
import { LandingFeatures } from './LandingFeatures.tsx'
import './landing.css'

export function LandingPage() {
  const { t } = useTranslation()
  return (
    <div className="landing-page">
      <a className="landing-skip" href="#landing-main">
        <Text>{t('Skip to content')}</Text>
      </a>
      <div className="landing-stage" id="top">
        <LandingHeader />
        <main id="landing-main">
          <LandingHero />
          <LandingFeatures />
          <section
            id="access"
            className="landing-access"
            aria-labelledby="access-title"
          >
            <div className="landing-access-copy">
              <Text as="h2" id="access-title">
                {t('Work with your team')}
              </Text>
              <Text as="p">
                {t(
                  'Sign in to create your own workspace, return to your projects, or accept an invitation from your team.',
                )}
              </Text>
            </div>
            <a className="landing-button landing-button-primary" href="/app">
              <Text>{t('Open your workspace')}</Text>
            </a>
          </section>
        </main>
        <footer className="landing-footer">
          <div className="landing-footer-top">
            <a className="landing-brand" href="#top">
              <ProductLogo width="28" height="28" />
              <Text as="span">{getProductBranding().productName}</Text>
            </a>
            <Text as="p">{t('Planning studio')}</Text>
            <ProjectLinks />
          </div>
          <div className="landing-footer-bottom">
            <Text as="p">
              {t('A planning studio. Deployment execution is not available.')}
            </Text>
            <div className="landing-footer-preferences">
              <ThemePicker />
              <InstallApp />
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
