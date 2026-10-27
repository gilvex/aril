import { Text } from '@/shared/ui/Text.tsx'
import { useCallback } from 'react'
import { ToggleGroup, ToggleGroupItem } from 'vagabond-ui/toggle-group'
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
  const selectDensity = useCallback(
    (value: string) => {
      if (value === 'Comfortable' || value === 'Compact')
        update({ ...design, density: value })
    },
    [design, update],
  )
  return (
    <aside
      className="design-style-panel"
      data-collaboration-scope="design-defaults"
    >
      <header>
        <SurfaceGrip />
        <Text as="h2">{t('Design defaults')}</Text>
        <button
          className="icon-button"
          aria-label={t('Close styles')}
          onClick={close}
        >
          <X size={17} />
        </button>
      </header>
      <Text as="p" className="design-defaults-hint">
        {t('Used for new elements and templates.')}
      </Text>
      <section>
        <Text as="h3">{t('Accent')}</Text>
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
        <Text as="label" className="design-custom-color">
          {t('Custom accent')}
          <input
            type="color"
            value={design.accent}
            onChange={(e) => update({ ...design, accent: e.target.value })}
          />
          <Text as="code">{design.accent}</Text>
        </Text>
      </section>
      <section>
        <Text as="h3">{t('Typography')}</Text>
        <Text as="label">
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
        </Text>
        <Text as="label">
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
        </Text>
      </section>
      <section>
        <Text as="h3">{t('Density')}</Text>
        <ToggleGroup
          data-studio-toggle-group
          type="single"
          value={design.density}
          onValueChange={selectDensity}
          aria-label={t('Density')}
        >
          {(['Comfortable', 'Compact'] as const).map((density) => (
            <ToggleGroupItem key={density} value={density}>
              <Text>{t(density)}</Text>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </section>
      <Text as="label" className="design-direction">
        {t('Direction notes')}
        <textarea
          rows={7}
          value={design.direction}
          maxLength={12000}
          onChange={(e) => update({ ...design, direction: e.target.value })}
        />
      </Text>
    </aside>
  )
}
