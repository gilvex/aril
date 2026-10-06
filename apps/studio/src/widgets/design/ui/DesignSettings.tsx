import { useTranslation } from '@/shared/i18n/index.ts'
import { Check } from 'lucide-react'

import type { DesignSettingsProps } from '../types/designSettingsProps.ts'
export function DesignSettings({
  colors,
  update,
  design,
}: DesignSettingsProps) {
  const { t } = useTranslation()

  return (
    <div className="design-settings">
      <section>
        <h3>
          01 <span>{t('Color direction')}</span>
        </h3>
        <p>{t('See the accent on a real working screen.')}</p>
        <div className="swatches">
          {colors.map((c) => (
            <button
              key={c}
              style={{ background: c }}
              aria-label={t('Use accent {{value}}', { value: c })}
              onClick={() => update({ ...design, accent: c })}
            >
              {design.accent === c && <Check size={18} color="white" />}
            </button>
          ))}
        </div>
        <label className="color-picker">
          {t('Custom accent')}
          <input
            type="color"
            aria-label={t('Custom accent')}
            value={design.accent}
            onChange={(e) => update({ ...design, accent: e.target.value })}
          />
          <code>{design.accent}</code>
        </label>
      </section>
      <section>
        <h3>
          02 <span>{t('Room to breathe')}</span>
        </h3>
        <div className="segmented">
          {(['Comfortable', 'Compact'] as const).map((d) => (
            <button
              key={t(d)}
              className={design.density === d ? 'active' : ''}
              onClick={() => update({ ...design, density: d })}
            >
              {d}
            </button>
          ))}
        </div>
        <p>
          {t(
            'Keep dense lists useful without making every screen feel crowded.',
          )}
        </p>
      </section>
      <section>
        <h3>
          03 <span>{t('Type with purpose')}</span>
        </h3>
        <div className="type-sample">
          {t('Aa')}{' '}
          <span>
            {t('Manrope')}
            <br />
            <small>{t('Headlines & structure')}</small>
          </span>
        </div>
        <div className="body-sample">
          {t('A familiar place for complex systems.')}
          <small>{t('DM Sans · Interface & body')}</small>
        </div>
      </section>
      <label>
        {t('Direction notes')}
        <textarea
          rows={5}
          value={design.direction}
          maxLength={12000}
          onChange={(e) => update({ ...design, direction: e.target.value })}
        />
      </label>
    </div>
  )
}
