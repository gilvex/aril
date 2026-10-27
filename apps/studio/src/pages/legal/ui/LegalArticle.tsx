import { useTranslation } from '@/shared/i18n/index.ts'
import { Mail } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { LegalOverview } from './LegalOverview.tsx'
import { LegalDocumentView } from './LegalDocumentView.tsx'
import type { LegalViewProps } from '../types/legalViewProps.ts'
export function LegalArticle({ document, missing }: LegalViewProps) {
  const { t } = useTranslation()
  return (
    <article id="legal-content" className="legal-content">
      {missing ? (
        <p>
          <a href="/legal">{t('Return to legal overview')}</a>
        </p>
      ) : document ? (
        <LegalDocumentView document={document} />
      ) : (
        <LegalOverview />
      )}
      <section className="legal-contact">
        <h2>{t('Questions or a privacy request?')}</h2>
        <p>
          {t(
            'Contact Ali Aliyev. Include enough information to identify your account or workspace, but never send passwords, agent credentials or invitation secrets.',
          )}
        </p>
        <Button asChild variant="outline">
          <a href="mailto:skaneprime@gmail.com">
            <Mail size={16} />
            skaneprime@gmail.com
          </a>
        </Button>
      </section>
    </article>
  )
}
