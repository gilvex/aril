import type { DesignPrinciplesProps } from '../types/designPrinciplesProps.ts'
export function DesignPrinciples({ t }: DesignPrinciplesProps) {
  return (
    <div className="design-principles">
      <div>
        <span>{t('Legible')}</span>
        <p>{t('Let structure do the work.')}</p>
      </div>
      <div>
        <span>{t('Reassuring')}</span>
        <p>{t('Show outcomes, not mystery.')}</p>
      </div>
      <div>
        <span>{t('Personal')}</span>
        <p>{t('Character without the noise.')}</p>
      </div>
    </div>
  )
}
