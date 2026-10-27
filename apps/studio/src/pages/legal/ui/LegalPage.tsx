import { LegalNavigation } from './LegalNavigation.tsx'
import { LegalArticle } from './LegalArticle.tsx'
import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { LanguagePicker, ThemePicker } from '@/features/appearance/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { legalDocuments } from '../config/legalDocuments.ts'
import './legal.css'

export function LegalPage() {
  const { t } = useTranslation()
  const slug = window.location.pathname.replace(/\/$/, '').split('/').at(-1)
  const document = legalDocuments.find((entry) => entry.slug === slug)
  const missing = slug !== 'legal' && !document
  const title = missing
    ? 'Legal page not found'
    : document?.title || 'Legal & privacy'
  useEffect(() => {
    window.document.title = `${t(title)} · Aril`
    if (window.location.hash)
      window.document
        .getElementById(window.location.hash.slice(1))
        ?.scrollIntoView()
  }, [title, t])
  return (
    <main className="legal-page">
      <a className="legal-skip" href="#legal-content">
        {t('Skip to content')}
      </a>
      <header className="legal-header">
        <a className="legal-brand" href="/legal">
          <img src="/aril.svg" width="26" height="26" alt="" />
          Aril<span>{t('Legal & privacy')}</span>
        </a>
        <Button asChild variant="outline" size="sm">
          <a href="/">
            <ArrowLeft size={16} />
            {t('Open studio')}
          </a>
        </Button>
      </header>
      <div className="legal-shell">
        <div className="legal-intro">
          <span className="legal-eyebrow">{t('Your work. Your rights.')}</span>
          <h1>{t(title)}</h1>
          <p>
            {t(
              document?.summary ||
                'Understand the service, your data, and the software you can build on.',
            )}
          </p>
          <span className="legal-date">
            {t('Prepared for review · 14 October 2026')}
          </span>
        </div>
        <aside className="legal-review" aria-label={t('Document status')}>
          <strong>{t('Draft policies — not yet effective')}</strong>
          <p>
            {t(
              'These proposed hosted-service policies are awaiting operator review. Registration, consent, transfer arrangements and retention details still need verification. The Apache-2.0 software license is separate and is available now.',
            )}
          </p>
        </aside>
        <div className="legal-layout">
          <LegalNavigation document={document} missing={missing} />
          <LegalArticle document={document} missing={missing} />
        </div>
        <footer className="legal-footer">
          <span>{t('Ali Aliyev · Azerbaijan · Free hosted service')}</span>
          <div>
            <LanguagePicker />
            <ThemePicker />
          </div>
        </footer>
      </div>
    </main>
  )
}
