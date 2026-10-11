import { useCallback, useEffect, useMemo, useRef, type MouseEvent } from 'react'
import { Background, Controls, ReactFlow, useReactFlow } from '@xyflow/react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { designLibraryGraph } from '../utils/designLibraryGraph.ts'
import { DesignLibraryGraphNode } from './DesignLibraryGraphNode.tsx'
import type { DesignLibraryGraphNode as AssetNode } from '../types/designLibraryGraphNode.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
const nodeTypes = { asset: DesignLibraryGraphNode }
export function DesignLibraryGraph({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { fitView } = useReactFlow()
  const container = useRef<HTMLDivElement>(null)
  const {
    library,
    design,
    usage,
    libraryQuery,
    libraryKind,
    libraryAsset,
    patch,
  } = model
  const graph = useMemo(
    () =>
      designLibraryGraph({
        library,
        pages: design.pages || [],
        usage,
        libraryQuery,
        libraryKind,
        libraryAsset,
      }),
    [library, design.pages, usage, libraryQuery, libraryKind, libraryAsset],
  )
  const structure = graph.nodes.map((n) => n.id).join('|')
  useEffect(() => {
    let frame = 0
    const fit = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(
        () => void fitView({ padding: 0.2, maxZoom: 1 }),
      )
    }
    const observer = new ResizeObserver(fit)
    if (container.current) observer.observe(container.current)
    fit()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [structure, fitView])
  const select = useCallback(
    (_event: MouseEvent, node: AssetNode) => patch({ libraryAsset: node.id }),
    [patch],
  )
  return (
    <div
      ref={container}
      className="design-library-graph"
      aria-label={t('Asset usage graph')}
    >
      <ReactFlow<AssetNode>
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        onNodeClick={select}
        nodesDraggable={false}
        nodesConnectable={false}
        deleteKeyCode={null}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        minZoom={0.02}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} color="var(--line)" />
        <Controls showInteractive={false} />
      </ReactFlow>
      {!graph.nodes.length && (
        <p className="library-graph-empty">{t('No matching assets')}</p>
      )}
    </div>
  )
}
