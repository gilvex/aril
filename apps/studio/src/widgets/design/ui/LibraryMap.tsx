import { useEffect } from 'react'
import { ReactFlow, Controls, Background, useReactFlow } from '@xyflow/react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { LibraryExplorerProps } from '../types/libraryExplorerProps.ts'
import type { LibraryMapNode as MapNode } from '../types/libraryMapNode.ts'
import { LibraryMapNode } from './LibraryMapNode.tsx'
import { LibraryMapEdge } from './LibraryMapEdge.tsx'
import { useLibraryMapControls } from '../model/useLibraryMapControls.ts'
const nodeTypes = { map: LibraryMapNode }
const edgeTypes = { library: LibraryMapEdge }
export function LibraryMap({ model, explorer }: LibraryExplorerProps) {
  const { t } = useTranslation()
  const { fitView } = useReactFlow()
  const { graph } = explorer
  const { nodes, select, clear, drag } = useLibraryMapControls({
    model,
    explorer,
  })
  const structure = graph.scopeKey
  useEffect(() => {
    const frame = requestAnimationFrame(
      () =>
        void fitView({
          padding: 0.2,
          maxZoom: 1,
          duration: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 0
            : 280,
        }),
    )
    return () => cancelAnimationFrame(frame)
  }, [structure, fitView])
  return (
    <div className="library-map" aria-label={t('Asset usage graph')}>
      <ReactFlow<MapNode>
        nodes={nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={select}
        onPaneClick={clear}
        onNodeDrag={drag}
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
        {t('Expand groups here. Drag to arrange.')}
      </span>
    </div>
  )
}
