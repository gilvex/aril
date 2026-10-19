import { getProductBranding } from '@/shared/deploymentSettings/index.ts'
import { ProductLogo } from '@/shared/ui/index.tsx'
import { ThemePicker } from '@/features/appearance/index.ts'
import { InstallApp } from '@/features/installApp/index.ts'
import { ProjectLinks } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { LandingPageProps } from '../types/landingPageProps.ts'
import { LandingHeader } from './LandingHeader.tsx'
import { LandingHero } from './LandingHero.tsx'
import { LandingFeatures } from './LandingFeatures.tsx'
import './landing.css'

export function LandingPage({ children }: LandingPageProps) {
  const { t } = useTranslation()
  return (
    <div className="landing-page">
      <a className="landing-skip" href="#landing-main">
        {t('Skip to content')}
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
              <h2 id="access-title">{t('Work with your team')}</h2>
              <p>
                {t(
                  'Sign in to create your own workspace, return to your projects, or accept an invitation from your team.',
                )}
              </p>
            </div>
            <div className="landing-access-form">{children}</div>
          </section>
        </main>
        <footer className="landing-footer">
          <div className="landing-footer-top">
            <a className="landing-brand" href="#top">
              <ProductLogo width="28" height="28" />
              <span>{getProductBranding().productName}</span>
            </a>
            <p>{t('Planning studio')}</p>
            <ProjectLinks />
          </div>
          <div className="landing-footer-bottom">
            <p>
              {t('A planning studio. Deployment execution is not available.')}
            </p>
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
