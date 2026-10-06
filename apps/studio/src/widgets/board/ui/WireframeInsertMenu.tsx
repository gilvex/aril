import { useTranslation } from '@/shared/i18n/index.ts'
import { CanvasInsertMenu } from '@/widgets/board/ui/CanvasInsertMenu.tsx'
import { useWireframeInsertMenuHandlers } from '../model/useWireframeInsertMenuHandlers.tsx'

import type { WireframeInsertMenuProps } from '../types/wireframeInsertMenuProps.ts'
export function WireframeInsertMenu({
  insertPoint,
  graph,
  setInsertPoint,
  add,
}: WireframeInsertMenuProps) {
  const { t } = useTranslation()

  const { items } = useWireframeInsertMenuHandlers({ add, insertPoint })
  return (
    <CanvasInsertMenu
      point={insertPoint}
      title={insertPoint.parentId ? t('Add to screen') : t('Add to wireframes')}
      disabled={graph.nodes.length >= 500}
      onClose={() => setInsertPoint(null)}
      items={items}
    />
  )
}
