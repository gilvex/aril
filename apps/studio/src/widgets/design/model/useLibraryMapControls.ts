import { useCallback, useMemo, type MouseEvent } from 'react'
import type { LibraryExplorerProps } from '../types/libraryExplorerProps.ts'
import type { LibraryMapNode } from '../types/libraryMapNode.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
export function useLibraryMapControls({
  model,
  explorer,
}: LibraryExplorerProps) {
  const { t } = useTranslation()
  const { patch, libraryPositions, libraryExpanded } = model
  const { graph } = explorer
  const expand = useCallback(
    (node: LibraryMapNode) => {
      const id = node.data.moreFor || node.id
      const next = { ...libraryExpanded }
      if (node.data.moreFor) next[id] = (next[id] || 12) + 12
      else if (next[id]) delete next[id]
      else next[id] = 12
      patch({
        libraryExpanded: next,
        libraryPositions: Object.fromEntries(
          graph.nodes
            .filter((item) => item.data.kind !== 'more')
            .map((item) => [
              item.id,
              libraryPositions[item.id] || item.position,
            ]),
        ),
      })
    },
    [libraryExpanded, libraryPositions, graph.nodes, patch],
  )
  const nodes = useMemo(
    () =>
      graph.nodes.map((node) => ({
        ...node,
        position:
          node.data.kind === 'more'
            ? node.position
            : libraryPositions[node.id] || node.position,
        ariaLabel: node.data.moreFor
          ? t('Show more')
          : `${node.data.label}, ${node.data.count}`,
        data: {
          ...node.data,
          toggle:
            node.data.path || node.data.moreFor
              ? () => expand(node)
              : undefined,
        },
      })),
    [graph.nodes, libraryPositions, expand, t],
  )
  const select = useCallback(
    (_event: MouseEvent, node: LibraryMapNode) => {
      if (node.data.path || node.data.moreFor) expand(node)
      else
        patch({
          libraryAsset: node.id,
          libraryUsageLimit: 50,
          libraryDetailsOpen: true,
        })
    },
    [patch, expand],
  )
  const clear = useCallback(
    () => patch({ libraryAsset: null, libraryFocus: false }),
    [patch],
  )
  const drag = useCallback(
    (_event: globalThis.MouseEvent | TouchEvent, node: LibraryMapNode) =>
      patch({
        libraryPositions: { ...libraryPositions, [node.id]: node.position },
      }),
    [patch, libraryPositions],
  )
  return { nodes, select, clear, drag }
}
