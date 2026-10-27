import { useTranslation } from '@/shared/i18n/index.ts'

export function LandingFeatures() {
  const { t } = useTranslation()
  return (
    <section
      id="studio"
      className="landing-features"
      aria-labelledby="studio-title"
    >
      <div className="landing-section-heading">
        <h2 id="studio-title">{t('Explore the studio')}</h2>
        <p>
          {t(
            'Work across Canvas, Design, Library, Scope, and Notes. Invite teammates to edit together and keep decisions with the project.',
          )}
        </p>
      </div>
      <div className="landing-feature-grid">
        <article>
          <h3>{t('Canvas')}</h3>
          <p>
            {t('Map services, dependencies, and user flows on an open canvas.')}
          </p>
        </article>
        <article>
          <h3>{t('Design')}</h3>
          <p>
            {t(
              'Draw interface layouts with nested frames, editable layers, and shared components.',
            )}
          </p>
        </article>
        <article>
          <h3>{t('Library')}</h3>
          <p>
            {t(
              'Reuse components and variables. Follow where each one is used.',
            )}
          </p>
        </article>
        <article>
          <h3>{t('Scope and Notes')}</h3>
          <p>
            {t(
              'Track requirements, write project notes, and record decisions with your team.',
            )}
          </p>
        </article>
      </div>
      <div className="landing-design-feature">
        <div>
          <h2>{t('Edit desktop and mobile layouts.')}</h2>
          <p>
            {t(
              'Arrange frames and layers on the design canvas. Reuse components and bind properties to variables from your library.',
            )}
          </p>
          <a
            className="landing-text-link"
            href="/w/demo/design?demo=1&board=layers"
          >
            {t('Try the design canvas')}
          </a>
        </div>
        <a
          className="landing-design-image"
          href="/w/demo/design?demo=1&board=layers"
          aria-label={t('Try the design canvas')}
        >
          <img
            src="/changelog/design.webp"
            alt={t(
              'Editable desktop and mobile interface designs in the Aril demo.',
            )}
            loading="lazy"
            width="1440"
            height="900"
          />
        </a>
      </div>
    </section>
  )
}
