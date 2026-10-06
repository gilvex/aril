import { useTranslation } from '@/shared/i18n/index.ts'
import { CanvasInsertMenu } from '@/widgets/board/ui/CanvasInsertMenu.tsx'
import { useBlueprintInsertMenuHandlers } from '../model/useBlueprintInsertMenuHandlers.tsx'

import type { BlueprintInsertMenuProps } from '../types/blueprintInsertMenuProps.ts'
export function BlueprintInsertMenu({
  insertPoint,
  board,
  setInsertPoint,
  addNode,
}: BlueprintInsertMenuProps) {
  const { t } = useTranslation()

  const { items } = useBlueprintInsertMenuHandlers({ addNode, insertPoint })
  return (
    <CanvasInsertMenu
      point={insertPoint}
      title={t('Add to canvas')}
      disabled={board.nodes.length >= 500}
      onClose={() => setInsertPoint(null)}
      items={items}
    />
  )
}
