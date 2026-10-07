import { useCompactLayout } from '@/shared/model/useCompactLayout.ts'
import { DesignLayersButton } from './DesignLayersButton.tsx'
import { DesignPagePicker } from './DesignPagePicker.tsx'
import type { DesignNavigationProps } from '../types/designNavigationProps.ts'
export function DesignNavigation({ model, navigation }: DesignNavigationProps) {
  const compact = useCompactLayout()
  return (
    <div className="design-navigation-stack">
      {navigation && (
        <div className="board-design-navigation">{navigation}</div>
      )}
      {!compact && (
        <div className="design-page-tools">
          <DesignPagePicker model={model} />
          <DesignLayersButton model={model} />
        </div>
      )}
    </div>
  )
}
