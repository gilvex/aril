import { useCallback, useEffect, useMemo, type MouseEvent } from 'react'
import { ReactFlow, Controls, Background, useReactFlow } from '@xyflow/react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { LibraryExplorerProps } from '../types/libraryExplorerProps.ts'
import type { LibraryMapNode as MapNode } from '../types/libraryMapNode.ts'
import { LibraryMapNode } from './LibraryMapNode.tsx'
const nodeTypes = { map: LibraryMapNode }
export function LibraryMap({ model, explorer }: LibraryExplorerProps) {
  const { t } = useTranslation()
  const { fitView } = useReactFlow()
  const { patch, libraryPositions } = model
  const { graph } = explorer
  const nodes = useMemo(
    () =>
      graph.nodes.map((n) => ({
        ...n,
        position: libraryPositions[n.id] || n.position,
        ariaLabel: `${n.data.label}, ${n.data.count}`,
      })),
    [graph.nodes, libraryPositions],
  )
  const structure = nodes.map((n) => n.id).join('|')
  useEffect(() => {
    const frame = requestAnimationFrame(
      () => void fitView({ padding: 0.25, maxZoom: 1 }),
    )
    return () => cancelAnimationFrame(frame)
  }, [structure, fitView])
  const select = useCallback(
    (_event: MouseEvent, node: MapNode) => {
      if (node.data.path)
        patch({
          libraryPath: node.data.path,
          libraryAsset: null,
          libraryFocus: false,
          libraryOffset: 0,
          libraryQuery: '',
        })
      else
        patch({
          libraryAsset: node.id,
          libraryUsageLimit: 50,
          libraryDetailsOpen: true,
        })
    },
    [patch],
  )
  const clear = useCallback(
    () => patch({ libraryAsset: null, libraryFocus: false }),
    [patch],
  )
  const drag = useCallback(
    (_event: globalThis.MouseEvent | TouchEvent, node: MapNode) =>
      patch({
        libraryPositions: { ...libraryPositions, [node.id]: node.position },
      }),
    [patch, libraryPositions],
  )
  return (
    <div className="library-map" aria-label={t('Asset usage graph')}>
      <ReactFlow<MapNode>
        nodes={nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        onNodeClick={select}
        onPaneClick={clear}
        onNodeDragStop={drag}
        nodesConnectable={false}
        deleteKeyCode={null}
        fitView
        fitViewOptions={{ padding: 0.25, maxZoom: 1 }}
        minZoom={0.1}
        maxZoom={2}
        onlyRenderVisibleElements
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} color="var(--line)" />
        <Controls showInteractive={false} />
      </ReactFlow>
      {!nodes.length && (
        <p className="library-graph-empty">{t('No matching assets')}</p>
      )}
      <span className="library-map-help">
        {t('Open a cluster to explore. Drag to arrange.')}
      </span>
    </div>
  )
}
