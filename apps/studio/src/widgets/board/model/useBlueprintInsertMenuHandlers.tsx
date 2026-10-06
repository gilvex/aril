import { useTranslation } from '@/shared/i18n/index.ts'
import { kindIcons } from '@/widgets/board/config/kindIcons.ts'
import { kindLabels } from '@/widgets/board/config/kindLabels.ts'
import { nodeKinds } from '@pomegranate/domain/workspace'
import { useMemo } from 'react'

import type { BlueprintInsertMenuHandlersProps } from '../types/useBlueprintInsertMenuHandlersProps.ts'
export function useBlueprintInsertMenuHandlers({
  addNode,
  insertPoint,
}: BlueprintInsertMenuHandlersProps) {
  const { t } = useTranslation()
  const items = useMemo(
    () =>
      nodeKinds.map((kind) => {
        const Icon = kindIcons[kind]
        return {
          id: kind,
          label: t(kindLabels[kind]),
          icon: <Icon size={16} />,
          onSelect: () => addNode(kind, insertPoint.position),
        }
      }),
    [addNode, insertPoint.position, t],
  )
  return { items }
}
