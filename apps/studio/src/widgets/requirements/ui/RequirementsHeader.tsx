import { Plus } from 'lucide-react'

import type { RequirementsHeaderProps } from '../types/requirementsHeaderProps.ts'
export function RequirementsHeader({ t, add }: RequirementsHeaderProps) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{t('The product brief')}</div>
        <h1>{t('A better way to deploy.')}</h1>
        <p>{t('Real pain points, turned into a plan you can build.')}</p>
      </div>
      <button className="button primary" onClick={add}>
        <Plus size={16} />
        {t('Add requirement')}
      </button>
    </div>
  )
}
