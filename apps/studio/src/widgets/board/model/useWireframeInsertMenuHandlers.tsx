import { useTranslation } from '@/shared/i18n/index.ts'
import { icons } from '@/widgets/board/config/wireframeBoardIcons.ts'
import { wireKinds, wireLabels } from '@pomegranate/domain/wireframe'
import { useMemo } from 'react'

import type { WireframeInsertMenuHandlersProps } from '../types/useWireframeInsertMenuHandlersProps.ts'
export function useWireframeInsertMenuHandlers({
  add,
  insertPoint,
}: WireframeInsertMenuHandlersProps) {
  const { t } = useTranslation()
  const items = useMemo(
    () =>
      wireKinds.map((kind) => {
        const Icon = icons[kind]
        return {
          id: kind,
          label: t(wireLabels[kind]),
          icon: <Icon size={16} />,
          onSelect: () => add(kind, insertPoint),
        }
      }),
    [add, insertPoint, t],
  )
  return { items }
}
