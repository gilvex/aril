import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { legalDocuments } from '../config/legalDocuments.ts'

export function LegalOverview() {
  const { t } = useTranslation()
  return (
    <>
      <div className="legal-cards">
        {legalDocuments.map((entry, index) => (
          <a
            className="legal-card"
            key={entry.slug}
            href={`/legal/${entry.slug}`}
          >
            <span className="legal-card-number">
              0{index + 1}
              <ArrowUpRight size={18} />
            </span>
            <h2>{t(entry.title)}</h2>
            <p>{t(entry.summary)}</p>
            <span>{t('Read draft')}</span>
          </a>
        ))}
      </div>
      <section className="legal-section">
        <h2>{t('Hosted service and open source')}</h2>
        <p>
          {t(
            'The proposed policies cover www.aril.studio, operated by Ali Aliyev in Azerbaijan as an individual. GilGil is a planned name, not a registered operator. A self-hosted installation has its own operator and privacy responsibilities.',
          )}
        </p>
        <p>
          {t(
            'Aril’s original source code is licensed under Apache-2.0. This does not license your private workspace content or replace the licenses of dependencies, fonts, icons and third-party skills.',
          )}
        </p>
      </section>
    </>
  )
}
