import { useTranslation } from '@/shared/i18n/index.ts'
import { ArrowUpRight } from 'lucide-react'
import { legalDocuments } from '../config/legalDocuments.ts'
import type { LegalViewProps } from '../types/legalViewProps.ts'
export function LegalNavigation({ document, missing }: LegalViewProps) {
  const { t } = useTranslation()
  return (
    <nav className="legal-navigation" aria-label={t('Legal documents')}>
      <a
        href="/legal"
        aria-current={!document && !missing ? 'page' : undefined}
      >
        {t('Overview')}
      </a>
      {legalDocuments.map((entry) => (
        <a
          key={entry.slug}
          href={`/legal/${entry.slug}`}
          aria-current={entry === document ? 'page' : undefined}
        >
          {t(entry.title)}
        </a>
      ))}
      <a href="/license.txt" target="_blank" rel="noopener noreferrer">
        Apache-2.0
        <ArrowUpRight size={14} />
      </a>
    </nav>
  )
}
