import { useTranslation } from '@/shared/i18n/index.ts'
import { StudioSelect } from '@/shared/ui/index.tsx'
import type { DesignElement } from '@pomegranate/domain/design'
import { DesignNumberInput } from './DesignNumberInput.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignTypography({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const node = model.selected[0]
  return (
    <section>
      <h3>{t('Typography')}</h3>
      <label>
        {t('Text content')}
        <textarea
          aria-label={t('Text content')}
          value={node.text}
          maxLength={12000}
          rows={3}
          onChange={(event) => model.edit({ text: event.target.value })}
        />
      </label>
      <label>
        {t('Font')}
        <StudioSelect
          aria-label={t('Font')}
          value={node.fontFamily}
          onChange={(event) =>
            model.edit({
              fontFamily: event.target.value as DesignElement['fontFamily'],
            })
          }
        >
          {['DM Sans', 'Manrope', 'System', 'Georgia'].map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </StudioSelect>
      </label>
      <div className="design-property-grid">
        <DesignNumberInput
          label={t('Font size')}
          value={node.fontSize}
          min={8}
          max={200}
          onChange={(fontSize) => model.edit({ fontSize })}
        />
        <label>
          {t('Text color')}
          <input
            aria-label={t('Text color')}
            type="color"
            value={node.color}
            onChange={(event) => model.edit({ color: event.target.value })}
          />
        </label>
        <label>
          {t('Weight')}
          <StudioSelect
            aria-label={t('Weight')}
            value={node.fontWeight}
            onChange={(event) =>
              model.edit({
                fontWeight: event.target.value as DesignElement['fontWeight'],
              })
            }
          >
            {['400', '500', '600', '700', '800'].map((weight) => (
              <option key={weight} value={weight}>
                {weight}
              </option>
            ))}
          </StudioSelect>
        </label>
        <label>
          {t('Alignment')}
          <StudioSelect
            aria-label={t('Alignment')}
            value={node.textAlign}
            onChange={(event) =>
              model.edit({
                textAlign: event.target.value as DesignElement['textAlign'],
              })
            }
          >
            <option value="left">{t('Left')}</option>
            <option value="center">{t('Center')}</option>
            <option value="right">{t('Right')}</option>
          </StudioSelect>
        </label>
      </div>
    </section>
  )
}
