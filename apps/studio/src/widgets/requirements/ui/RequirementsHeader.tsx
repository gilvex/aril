import { Text } from '@/shared/ui/Text.tsx'
import { Plus } from 'lucide-react'

import type { RequirementsHeaderProps } from '../types/requirementsHeaderProps.ts'
export function RequirementsHeader({ t, add }: RequirementsHeaderProps) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          <Text>{t('The product brief')}</Text>
        </div>
        <Text as="h1">{t('A better way to deploy.')}</Text>
        <Text as="p">
          {t('Real pain points, turned into a plan you can build.')}
        </Text>
      </div>
      <button className="button primary" onClick={add}>
        <Plus size={16} />
        <Text>{t('Add requirement')}</Text>
      </button>
    </div>
  )
}
