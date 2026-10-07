import { useTranslation } from '@/shared/i18n/index.ts'
import { DesignNumberInput } from './DesignNumberInput.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignPaint({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const node = model.selected[0]
  return (
    <section>
      <h3>{t('Appearance')}</h3>
      <div className="design-property-grid">
        <label>
          {t('Fill')}
          <input
            aria-label={t('Fill')}
            type="color"
            value={node.fill === 'transparent' ? '#ffffff' : node.fill}
            onChange={(event) => model.edit({ fill: event.target.value })}
          />
        </label>
        <label>
          {t('Border color')}
          <input
            aria-label={t('Border color')}
            type="color"
            value={node.stroke}
            onChange={(event) => model.edit({ stroke: event.target.value })}
          />
        </label>
        <DesignNumberInput
          label={t('Corner radius')}
          min={0}
          max={1000}
          value={node.radius}
          onChange={(radius) => model.edit({ radius })}
        />
        <DesignNumberInput
          label={t('Border width')}
          min={0}
          max={20}
          value={node.strokeWidth}
          onChange={(strokeWidth) => model.edit({ strokeWidth })}
        />
      </div>
      <label className="design-checkbox">
        <input
          type="checkbox"
          checked={node.fill === 'transparent'}
          onChange={(event) =>
            model.edit({
              fill: event.target.checked ? 'transparent' : '#ffffff',
            })
          }
        />
        {t('Transparent fill')}
      </label>
    </section>
  )
}
