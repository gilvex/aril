import { useTranslation } from '@/shared/i18n/index.ts'
import type { LegalDocumentViewProps } from '../types/legalDocumentViewProps.ts'
export function LegalDocumentView({ document }: LegalDocumentViewProps) {
  const { t } = useTranslation()
  return (
    <>
      <nav className="legal-contents" aria-label={t('On this page')}>
        <strong>{t('On this page')}</strong>
        {document.sections.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            {t(section.title)}
          </a>
        ))}
      </nav>
      {document.sections.map((section, index) => (
        <section
          className="legal-section"
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-title`}
        >
          <h2 id={`${section.id}-title`}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            {t(section.title)}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{t(paragraph)}</p>
          ))}
          {section.links && (
            <ul>
              {section.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{t(link.label)}</a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  )
}
