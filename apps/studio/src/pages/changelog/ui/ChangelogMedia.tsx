import { useTranslation } from '@/shared/i18n/index.ts'
import type { ReleaseEntry } from '../types/releaseEntry.ts'

export function ChangelogMedia({ entry }: { entry: ReleaseEntry }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language.startsWith('ru') ? 'ru' : 'en'
  return (
    <figure>
      {entry.video ? (
        <>
          <video
            controls
            playsInline
            preload="metadata"
            poster={entry.image}
            width="1440"
            height="900"
            aria-label={t(entry.videoAlt ?? entry.imageAlt)}
          >
            <source src={entry.video} type="video/mp4" />
            <track
              kind="captions"
              src={`${entry.video}.${language}.vtt`}
              srcLang={language}
              label={language === 'ru' ? 'Русский' : 'English'}
              default
            />
            <a href={entry.video}>{t('Download the demo video')}</a>
          </video>
          <figcaption>
            {t(entry.videoAlt ?? entry.imageAlt)}{' '}
            {t('Real demo recording · no audio. Press play to watch.')}
          </figcaption>
          <a
            className="changelog-video-link"
            href={entry.video}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('Open video')}
          </a>
        </>
      ) : (
        <>
          <a
            href={entry.image}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('Open screenshot: {{description}}', {
              description: t(entry.imageAlt),
            })}
          >
            <img
              src={entry.image}
              alt={t(entry.imageAlt)}
              width="1600"
              height="900"
              loading="lazy"
              decoding="async"
            />
          </a>
          <figcaption>{t(entry.imageAlt)}</figcaption>
        </>
      )}
    </figure>
  )
}
