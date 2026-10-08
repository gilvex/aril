import { StudioSelect } from '@/shared/ui/index.tsx'
import { SurfaceGrip } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { Check, X } from 'lucide-react'
import type { DesignSettingsProps } from '../types/designSettingsProps.ts'
const fonts = ['Manrope', 'DM Sans', 'System', 'Georgia'] as const
export function DesignSettings({
  colors,
  update,
  design,
  close,
}: DesignSettingsProps) {
  const { t } = useTranslation()
  return (
    <aside
      className="design-style-panel"
      data-collaboration-scope="design-defaults"
    >
      <header>
        <SurfaceGrip />
        <h2>{t('Design defaults')}</h2>
        <button
          className="icon-button"
          aria-label={t('Close styles')}
          onClick={close}
        >
          <X size={17} />
        </button>
      </header>
      <p className="design-defaults-hint">
        {t('Used for new elements and templates.')}
      </p>
      <section>
        <h3>{t('Accent')}</h3>
        <div className="design-color-options">
          {colors.map((color) => (
            <button
              key={color}
              style={{ background: color }}
              aria-label={t('Use accent {{value}}', { value: color })}
              aria-pressed={design.accent === color}
              onClick={() => update({ ...design, accent: color })}
            >
              {design.accent === color && <Check size={17} />}
            </button>
          ))}
        </div>
        <label className="design-custom-color">
          {t('Custom accent')}
          <input
            type="color"
            value={design.accent}
            onChange={(e) => update({ ...design, accent: e.target.value })}
          />
          <code>{design.accent}</code>
        </label>
      </section>
      <section>
        <h3>{t('Typography')}</h3>
        <label>
          {t('Headings')}
          <StudioSelect
            value={design.headingFont || 'Manrope'}
            onChange={(e) =>
              update({
                ...design,
                headingFont: e.target.value as typeof design.headingFont,
              })
            }
          >
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </StudioSelect>
        </label>
        <label>
          {t('Body text')}
          <StudioSelect
            value={design.bodyFont || 'DM Sans'}
            onChange={(e) =>
              update({
                ...design,
                bodyFont: e.target.value as typeof design.bodyFont,
              })
            }
          >
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </StudioSelect>
        </label>
      </section>
      <section>
        <h3>{t('Density')}</h3>
        <div className="segmented">
          {(['Comfortable', 'Compact'] as const).map((density) => (
            <button
              key={density}
              aria-pressed={design.density === density}
              className={design.density === density ? 'active' : ''}
              onClick={() => update({ ...design, density })}
            >
              {t(density)}
            </button>
          ))}
        </div>
      </section>
      <label className="design-direction">
        {t('Direction notes')}
        <textarea
          rows={7}
          value={design.direction}
          maxLength={12000}
          onChange={(e) => update({ ...design, direction: e.target.value })}
        />
      </label>
    </aside>
  )
}
