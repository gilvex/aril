import { useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import {
  groupDesignElements,
  ungroupDesignElements,
  type DesignElement,
} from '@pomegranate/domain/design'
export function useDesignStructureActions(
  nodes: DesignElement[],
  selection: string[],
  save: (nodes: DesignElement[]) => void,
  select: (ids: string[]) => void,
) {
  const { t } = useTranslation()
  const group = useCallback(
    (mode: 'group' | 'frame' | 'mask' = 'group', ids = selection) => {
      const id = crypto.randomUUID()
      const next = groupDesignElements(
        nodes,
        ids,
        id,
        t(
          mode === 'mask' ? 'Mask group' : mode === 'frame' ? 'Frame' : 'Group',
        ),
        mode,
      )
      if (next === nodes) return
      save(next)
      select([id])
    },
    [nodes, save, select, selection, t],
  )
  const ungroup = useCallback(
    (ids = selection) => {
      let next = nodes
      const children: string[] = []
      for (const id of ids) {
        const result = ungroupDesignElements(next, id)
        if (result !== next)
          children.push(
            ...next
              .filter((node) => node.parentId === id)
              .map((node) => node.id),
          )
        next = result
      }
      if (next === nodes) return
      save(next)
      select(children)
    },
    [nodes, save, select, selection],
  )
  return { group, ungroup }
}
