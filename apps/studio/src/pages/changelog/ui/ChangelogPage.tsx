import { getProductBranding } from '@/shared/deploymentSettings/index.ts'
import { ProductLogo } from '@/shared/ui/index.tsx'
import { useEffect } from 'react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { LanguagePicker, ThemePicker } from '@/features/appearance/index.ts'
import { ProjectLinks } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { releases } from '../config/releases.ts'
import { ChangelogEntry } from './ChangelogEntry.tsx'
import './changelog.css'

export function ChangelogPage() {
  const { t } = useTranslation()
  useEffect(() => {
    document.title = `${t('Changelog')} · ${getProductBranding().productName}`
    if (window.location.hash)
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView()
  }, [t])
  return (
    <main className="changelog-page">
      <a className="changelog-skip" href="#updates">
        {t('Skip to updates')}
      </a>
      <header className="changelog-header">
        <a
          className="changelog-brand"
          href="/"
          aria-label={t('Open {{product}}', {
            product: getProductBranding().productName,
          })}
        >
          <ProductLogo width="24" height="24" />
          {getProductBranding().productName}
          <span>{t('Changelog')}</span>
        </a>
        <Button asChild variant="outline" size="sm">
          <a href="/app">
            <ArrowLeft size={16} />
            {t('Open studio')}
          </a>
        </Button>
      </header>
      <div className="changelog-shell">
        <section className="changelog-intro" aria-labelledby="changelog-title">
          <span className="changelog-eyebrow">{t('Built in the open')}</span>
          <h1 id="changelog-title">{t('A little better, every update.')}</h1>
          <p>
            {t(
              'New features, improvements and fixes across Aril. Here’s what changed and how it looks.',
            )}
          </p>
          <Button asChild variant="outline">
            <a href="/?demo=1">
              {t('Explore the demo')}
              <ArrowUpRight size={16} />
            </a>
          </Button>
        </section>
        <div className="changelog-layout">
          <aside className="changelog-index">
            <nav aria-label={t('Updates')}>
              <strong>{t('Updates')}</strong>
              {releases.map((entry) => (
                <a key={entry.id} href={`#${entry.id}`}>
                  {t(entry.title)}
                </a>
              ))}
            </nav>
            <p>
              {t('Screenshots use sample data. Demo teammates are simulated.')}
            </p>
          </aside>
          <section id="updates" aria-label={t('Release notes')}>
            {releases.map((entry) => (
              <ChangelogEntry key={entry.id} entry={entry} />
            ))}
          </section>
        </div>
        <footer className="changelog-footer">
          <ProjectLinks />
          <div>
            <LanguagePicker />
            <ThemePicker />
          </div>
        </footer>
      </div>
    </main>
  )
}
