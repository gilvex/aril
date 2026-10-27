import { useTranslation } from '@/shared/i18n/index.ts'
import { DesignNumberInput } from './DesignNumberInput.tsx'
import { DesignColorInput } from './DesignColorInput.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignPaint({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const node = model.selected[0]
  return (
    <>
      <section>
        <h3>{t('Appearance')}</h3>
        <DesignNumberInput
          label={t('Corner radius')}
          min={0}
          max={1000}
          value={node.radius}
          onChange={(radius) => model.edit({ radius })}
        />
      </section>
      <section>
        <h3>{t('Fill')}</h3>
        <DesignColorInput
          label={t('Fill')}
          value={node.fill === 'transparent' ? '#ffffff' : node.fill}
          onChange={(fill) => model.edit({ fill })}
        />
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
      <section>
        <h3>{t('Stroke')}</h3>
        <DesignColorInput
          label={t('Border color')}
          value={node.stroke}
          onChange={(stroke) => model.edit({ stroke })}
        />
        <DesignNumberInput
          label={t('Border width')}
          min={0}
          max={20}
          value={node.strokeWidth}
          onChange={(strokeWidth) => model.edit({ strokeWidth })}
        />
      </section>
    </>
  )
}
