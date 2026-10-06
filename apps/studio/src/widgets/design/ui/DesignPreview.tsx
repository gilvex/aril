import { useTranslation } from '@/shared/i18n/index.ts'
import { Activity, ChevronRight, ShieldCheck, Terminal } from 'lucide-react'
import { type CSSProperties } from 'react'
import { DesignPrinciples } from './DesignPrinciples.tsx'
import { DesignServicesPreview } from './DesignServicesPreview.tsx'

import type { DesignPreviewProps } from '../types/designPreviewProps.ts'
export function DesignPreview({
  design,
  tab,
  setTab,
  selected,
  setSelected,
}: DesignPreviewProps) {
  const { t } = useTranslation()

  return (
    <div className="preview-area">
      <div className="preview-label">
        <span className="small-dot" />
        {t('Interactive UI study')}
        <span>{t('Sample data')}</span>
      </div>
      <div
        className={`product-preview ${design.density.toLowerCase()}`}
        style={{ '--preview-accent': design.accent } as CSSProperties}
      >
        <div className="preview-top">
          <span className="preview-brand">
            <img src="/mark.svg" alt="" />
            {t('pomegranate')}
          </span>
          <span className="avatar">{t('JD')}</span>
        </div>
        <div className="preview-nav">
          {t('My workspace')}
          <ChevronRight size={12} />
          {t('Weekend servers')}
        </div>
        <div className="preview-title">
          <div>
            <h2>{t('Weekend servers')}</h2>
            <p>{t('A little world of your own.')}</p>
          </div>
          <span className="preview-health">
            <span />
            {t('All systems healthy')}
          </span>
        </div>
        <div className="preview-tabs">
          {['Services', 'Activity', 'Access'].map((x) => (
            <button
              key={t(x)}
              className={tab === x ? 'active' : ''}
              onClick={() => setTab(x)}
            >
              {t(x)}
            </button>
          ))}
        </div>
        {tab === 'Services' ? (
          <DesignServicesPreview
            t={t}
            selected={selected}
            setSelected={setSelected}
          />
        ) : tab === 'Activity' ? (
          <div className="preview-events">
            <h3>
              <Activity size={17} />
              {t('A history you can rely on')}
            </h3>
            {[
              'All 3 instances passed health checks',
              'Deployment batch completed · 3/3',
              'Game layer reused from cache',
              'Blueprint v1.2 published',
            ].map((x, i) => (
              <div key={t(x)}>
                <span className="event-bullet" />
                <span>
                  {t(x)}
                  <small>
                    {i + 1} {i === 0 ? t('minute') : t('minutes')}{' '}
                    {t('ago · sample event')}
                  </small>
                </span>
              </div>
            ))}
            <p>
              <Terminal size={14} />
              {t('Logs stay here, even after you close the tab.')}
            </p>
          </div>
        ) : (
          <div className="preview-events">
            <h3>
              <ShieldCheck size={17} />
              {t('Access that makes sense')}
            </h3>
            {[
              'Alex · Project owner',
              'Sam · Server operator',
              'Taylor · Read-only observer',
            ].map((x) => (
              <div key={t(x)}>
                <span className="avatar">{x[0]}</span>
                <span>
                  {t(x)}
                  <small>{t('Access inherited from Weekend servers')}</small>
                </span>
              </div>
            ))}
            <p>
              {t('This is a visual study, not an active permissions system.')}
            </p>
          </div>
        )}
      </div>
      <DesignPrinciples t={t} />
      <p className="study-note">
        {t(
          'This board explores the future deployment UI. Nothing here launches or changes infrastructure.',
        )}
      </p>
    </div>
  )
}
