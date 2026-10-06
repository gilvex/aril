import { useTranslation } from '@/shared/i18n/index.ts'
import { Monitor, Smartphone, SlidersHorizontal } from 'lucide-react'
import { createDesignBoardState } from '../model/createDesignBoardState.ts'
import { useDesignBoardModel } from '../model/useDesignBoardModel.ts'
import type { DesignBoardProps } from '../types/designBoardProps.ts'
import { DesignPreview } from './DesignPreview.tsx'
import { DesignSettings } from './DesignSettings.tsx'
import '../design.css'
export function DesignBoard({ design, update }: DesignBoardProps) {
  const { t } = useTranslation()
  const model = useDesignBoardModel(createDesignBoardState)
  return (
    <section className="design-workbench">
      <header className="design-workbench-toolbar">
        <h1>{t('Design')}</h1>
        <select
          aria-label={t('Sample screen')}
          value={model.tab}
          onChange={(e) => model.setTab(e.target.value)}
        >
          {['Services', 'Activity', 'Access'].map((tab) => (
            <option key={tab} value={tab}>
              {t(tab === 'Services' ? 'Servers' : tab)}
            </option>
          ))}
        </select>
        <div className="segmented">
          <button
            aria-label={t('Desktop preview')}
            aria-pressed={model.device === 'desktop'}
            className={model.device === 'desktop' ? 'active' : ''}
            onClick={() => model.patch({ device: 'desktop' })}
          >
            <Monitor size={16} />
          </button>
          <button
            aria-label={t('Mobile preview')}
            aria-pressed={model.device === 'mobile'}
            className={model.device === 'mobile' ? 'active' : ''}
            onClick={() => model.patch({ device: 'mobile' })}
          >
            <Smartphone size={16} />
          </button>
        </div>
        <div className="segmented">
          {(['light', 'dark'] as const).map((theme) => (
            <button
              key={theme}
              aria-pressed={model.theme === theme}
              className={model.theme === theme ? 'active' : ''}
              onClick={() => model.patch({ theme })}
            >
              {t(theme === 'light' ? 'Light' : 'Dark')}
            </button>
          ))}
        </div>
        <button
          className="button"
          aria-expanded={model.inspector}
          onClick={() => model.patch({ inspector: !model.inspector })}
        >
          <SlidersHorizontal size={16} />
          {t('Styles')}
        </button>
      </header>
      <div className="design-workbench-layout">
        <div className="design-stage">
          <div className="design-stage-caption">
            <span>{t('Weekend servers')}</span>
            <span>
              {t('Preview only')} ·{' '}
              {model.device === 'mobile' ? '390 px' : t('Desktop')}
            </span>
          </div>
          <DesignPreview design={design} {...model} />
        </div>
        {model.inspector && (
          <DesignSettings
            colors={['#b34568', '#7955ad', '#386a92', '#307568', '#9c603a']}
            update={update}
            design={design}
            close={() => model.patch({ inspector: false })}
          />
        )}
      </div>
    </section>
  )
}
