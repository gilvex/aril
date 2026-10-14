import { useTranslation } from '@/shared/i18n/index.ts'
import { LandingBackdrop } from './LandingBackdrop.tsx'

export function LandingHero() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage === 'ru' ? 'ru' : 'en'
  return (
    <section className="landing-hero" aria-labelledby="landing-title">
      <LandingBackdrop />
      <div className="landing-hero-copy">
        <h1 id="landing-title">
          {t('Plan the architecture.')}
          <br />
          {t('Design the interface.')}
        </h1>
        <p>
          {t(
            'Aril brings diagrams, interface design, requirements, and notes into a shared workspace for your team.',
          )}
        </p>
        <div className="landing-hero-actions">
          <a
            className="landing-button landing-button-primary"
            href="/?demo=1&workspace=demo&board=layers&view=canvas"
          >
            {t('Explore the demo')}
          </a>
          <a className="landing-text-link" href="#access">
            {t('Open your workspace')}
          </a>
        </div>
        <p className="landing-demo-note">
          {t('The demo is editable. No account needed.')}
        </p>
      </div>
      <figure className="landing-preview">
        <div className="landing-preview-bar">
          <span>{t('Studio walkthrough')}</span>
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
        <figcaption>
          {t('Recorded in the editable demo, with simulated teammates.')}
        </figcaption>
      </figure>
    </section>
  )
}
