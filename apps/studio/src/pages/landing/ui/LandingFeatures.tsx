import { Text } from '@/shared/ui/Text.tsx'
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
        <Text as="h2" id="studio-title">
          {t('Explore the studio')}
        </Text>
        <Text as="p">
          {t(
            'Work across Canvas, Design, Library, Scope, and Notes. Invite teammates to edit together and keep decisions with the project.',
          )}
        </Text>
      </div>
      <div className="landing-feature-grid">
        <article>
          <Text as="h3">{t('Canvas')}</Text>
          <Text as="p">
            {t('Map services, dependencies, and user flows on an open canvas.')}
          </Text>
        </article>
        <article>
          <Text as="h3">{t('Design')}</Text>
          <Text as="p">
            {t(
              'Draw interface layouts with nested frames, editable layers, and shared components.',
            )}
          </Text>
        </article>
        <article>
          <Text as="h3">{t('Library')}</Text>
          <Text as="p">
            {t(
              'Reuse components and variables. Follow where each one is used.',
            )}
          </Text>
        </article>
        <article>
          <Text as="h3">{t('Scope and Notes')}</Text>
          <Text as="p">
            {t(
              'Track requirements, write project notes, and record decisions with your team.',
            )}
          </Text>
        </article>
      </div>
      <div className="landing-design-feature">
        <div>
          <Text as="h2">{t('Edit desktop and mobile layouts.')}</Text>
          <Text as="p">
            {t(
              'Arrange frames and layers on the design canvas. Reuse components and bind properties to variables from your library.',
            )}
          </Text>
          <a
            className="landing-text-link"
            href="/w/demo/design?demo=1&board=layers"
          >
            <Text>{t('Try the design canvas')}</Text>
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
