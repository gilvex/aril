import { Text } from '@/shared/ui/Text.tsx'
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
        <Text>{t('Skip to updates')}</Text>
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
          <Text>{getProductBranding().productName}</Text>
          <Text as="span">{t('Changelog')}</Text>
        </a>
        <Button asChild variant="outline" size="sm">
          <a href="/app">
            <ArrowLeft size={16} />
            <Text>{t('Open studio')}</Text>
          </a>
        </Button>
      </header>
      <div className="changelog-shell">
        <section className="changelog-intro" aria-labelledby="changelog-title">
          <Text as="span" className="changelog-eyebrow">
            {t('Built in the open')}
          </Text>
          <Text as="h1" id="changelog-title">
            {t('A little better, every update.')}
          </Text>
          <Text as="p">
            {t(
              'New features, improvements and fixes across Aril. Here’s what changed and how it looks.',
            )}
          </Text>
          <Button asChild variant="outline">
            <a href="/?demo=1">
              <Text>{t('Explore the demo')}</Text>
              <ArrowUpRight size={16} />
            </a>
          </Button>
        </section>
        <div className="changelog-layout">
          <aside className="changelog-index">
            <nav aria-label={t('Updates')}>
              <Text as="strong">{t('Updates')}</Text>
              {releases.map((entry) => (
                <a key={entry.id} href={`#${entry.id}`}>
                  <Text>{t(entry.title)}</Text>
                </a>
              ))}
            </nav>
            <Text as="p">
              {t('Screenshots use sample data. Demo teammates are simulated.')}
            </Text>
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
