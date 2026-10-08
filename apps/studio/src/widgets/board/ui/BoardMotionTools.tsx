import { useCallback } from 'react'
import { Play, SkipForward, RotateCcw } from 'lucide-react'
import { StudioActionButton } from '@/shared/ui/index.tsx'
import { useCanvasTools } from '@/features/canvasTools/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { BlueprintToolbarProps } from '../types/blueprintToolbarProps.ts'
export function BoardMotionTools({
  board,
  flow,
}: Pick<BlueprintToolbarProps, 'board' | 'flow'>) {
  const { t } = useTranslation()
  const { flowIndex, patch } = useCanvasTools()
  const step = useCallback(() => {
    if (!flow || !board.nodes.length) return
    const current = board.nodes[flowIndex]
    const edge = board.edges.find((item) => item.source === current?.id)
    const next = edge
      ? board.nodes.findIndex((node) => node.id === edge.target)
      : (flowIndex + 1) % board.nodes.length
    patch({ flowIndex: next })
    void flow.fitView({
      nodes: [{ id: board.nodes[next].id }],
      padding: 0.6,
      maxZoom: 1,
      duration: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 0
        : 350,
    })
  }, [board, flow, flowIndex, patch])
  const reset = useCallback(() => {
    patch({ flowIndex: -1 })
    void flow?.fitView({
      padding: 0.2,
      duration: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 0
        : 220,
    })
  }, [flow, patch])
  return (
    <>
      <StudioActionButton
        disabled={!flow || !board.nodes.length}
        onClick={step}
        title={t(
          flowIndex < 0 ? 'Walk through connections' : 'Next connected node',
        )}
        aria-label={t(
          flowIndex < 0 ? 'Walk through connections' : 'Next connected node',
        )}
      >
        {flowIndex < 0 ? <Play size={18} /> : <SkipForward size={18} />}
      </StudioActionButton>
      <StudioActionButton
        disabled={!flow}
        onClick={reset}
        title={t('Fit canvas')}
        aria-label={t('Fit canvas')}
      >
        <RotateCcw size={18} />
      </StudioActionButton>
    </>
  )
}
