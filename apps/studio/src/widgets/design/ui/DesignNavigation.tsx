import { DesignPagePicker } from './DesignPagePicker.tsx'
import type { DesignNavigationProps } from '../types/designNavigationProps.ts'
export function DesignNavigation({ model, navigation }: DesignNavigationProps) {
  return (
    <div className="design-navigation-stack">
      {navigation && (
        <div className="board-design-navigation">{navigation}</div>
      )}
      <DesignPagePicker model={model} />
    </div>
  )
}
