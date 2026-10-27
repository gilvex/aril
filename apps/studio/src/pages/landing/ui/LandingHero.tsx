import { Text } from '@/shared/ui/Text.tsx'
import { getProductBranding } from '@/shared/deploymentSettings/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { LandingBackdrop } from './LandingBackdrop.tsx'

export function LandingHero() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage === 'ru' ? 'ru' : 'en'
  return (
    <section className="landing-hero" aria-labelledby="landing-title">
      <LandingBackdrop />
      <div className="landing-hero-copy">
        <Text as="h1" id="landing-title">
          {t('Plan the architecture.')}
          <br />
          {t('Design the interface.')}
        </Text>
        <Text as="p">
          {t(
            '{{product}} brings diagrams, interface design, requirements, and notes into a shared workspace for your team.',
            { product: getProductBranding().productName },
          )}
        </Text>
        <div className="landing-hero-actions">
          <a
            className="landing-button landing-button-primary"
            href="/app?demo=1&workspace=demo&board=layers&view=canvas"
          >
            <Text>{t('Explore the demo')}</Text>
          </a>
          <a className="landing-text-link" href="/app">
            <Text>{t('Open your workspace')}</Text>
          </a>
        </div>
        <Text as="p" className="landing-demo-note">
          {t('The demo is editable. No account needed.')}
        </Text>
      </div>
      <figure className="landing-preview">
        <div className="landing-preview-bar">
          <Text as="span">{t('Studio walkthrough')}</Text>
        </div>
        <video
          key={locale}
          controls
          playsInline
          preload="none"
          poster="/changelog/canvas.webp"
          aria-label={t(
            'Watch the studio workflow: Canvas, Design, and Library.',
          )}
        >
          <source src="/changelog/studio-tour.mp4" type="video/mp4" />
          <track
            kind="captions"
            src={`/changelog/studio-tour.mp4.${locale}.vtt`}
            srcLang={locale}
            label={locale === 'ru' ? 'Русский' : 'English'}
            default
          />
        </video>
        <Text as="figcaption">
          {t('Recorded in the editable demo, with simulated teammates.')}
        </Text>
      </figure>
    </section>
  )
}
