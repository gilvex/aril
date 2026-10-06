import { Box, Search } from 'lucide-react'
import { DesignServiceRow } from './DesignServiceRow.tsx'

import type { DesignServicesPreviewProps } from '../types/designServicesPreviewProps.ts'
export function DesignServicesPreview({
  t,
  selected,
  setSelected,
}: DesignServicesPreviewProps) {
  return (
    <>
      <div className="preview-list-toolbar">
        <span>
          <Search size={14} />
          {t('Your services')}
        </span>
        <span>
          {selected.length
            ? t('{{count}} selected', { count: selected.length })
            : t('3 services')}
        </span>
      </div>
      {['Survival · EU', 'Creative · EU', 'Survival · US'].map(
        (name, index) => (
          <DesignServiceRow
            key={name}
            name={name}
            selected={selected}
            setSelected={setSelected}
            t={t}
            index={index}
          />
        ),
      )}
      {selected.length > 0 && (
        <div className="preview-selection">
          {selected.length}{' '}
          {t(
            'services selected. In the product, batch actions would appear here.',
          )}
        </div>
      )}
      <div className="preview-footnote">
        <Box size={15} />
        {t('One blueprint. Three places to play.')}
      </div>
    </>
  )
}
