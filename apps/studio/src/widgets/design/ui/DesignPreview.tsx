import { Text } from '@/shared/ui/Text.tsx'
import { ProductLogo } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { type CSSProperties } from 'react'
import { DesignSampleServers } from './DesignSampleServers.tsx'
import { DesignSampleDetails } from './DesignSampleDetails.tsx'
import type { DesignPreviewProps } from '../types/designPreviewProps.ts'
export function DesignPreview(props: DesignPreviewProps) {
  const { t } = useTranslation()
  const { design, tab, device, theme } = props
  const fonts = {
    Manrope: 'Manrope Variable, sans-serif',
    'DM Sans': '"DM Sans Variable", sans-serif',
    System: 'system-ui, sans-serif',
    Georgia: 'Georgia, serif',
  }
  const style = {
    '--study-accent': design.accent,
    '--study-heading': fonts[design.headingFont || 'Manrope'],
    '--study-body': fonts[design.bodyFont || 'DM Sans'],
  } as CSSProperties
  return (
    <div
      className={
        'design-sample device-' +
        device +
        ' theme-' +
        theme +
        ' density-' +
        design.density.toLowerCase()
      }
      style={style}
    >
      <header className="design-sample-brand">
        <Text as="span">
          <ProductLogo />
          aril
        </Text>
        <Text as="span" className="design-sample-avatar">
          JD
        </Text>
      </header>
      <div className="design-sample-body">
        <Text as="p" className="design-sample-breadcrumb">
          {t('My workspace')} / {t('Weekend servers')}
        </Text>
        <div className="design-sample-heading">
          <Text as="h2">{t(tab === 'Services' ? 'Servers' : tab)}</Text>
          <Text as="span" className="design-sample-tag">
            {t('Sample data')}
          </Text>
        </div>
        {tab === 'Services' ? (
          <DesignSampleServers {...props} />
        ) : (
          <DesignSampleDetails tab={tab} />
        )}
      </div>
      <footer className="design-sample-footer">
        <Text>{t('Preview only')}</Text> <Text>· </Text>
        <Text>{t('Changes here do not affect infrastructure.')}</Text>
      </footer>
    </div>
  )
}
