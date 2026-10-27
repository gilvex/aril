import { useTranslation } from '@/shared/i18n/index.ts'
import type { RoutedEdge } from '@/widgets/board/types/routedEdge.ts'
import { SelectionBadges } from '@/widgets/board/ui/SelectionBadges.tsx'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useViewport,
  type EdgeProps,
} from '@xyflow/react'
export function WireframeEdge(props: EdgeProps<RoutedEdge>) {
  const { t } = useTranslation()

  const fallback = getSmoothStepPath(props)
  const { path, labelX, labelY } = props.data?.route || {
    path: fallback[0],
    labelX: fallback[1],
    labelY: fallback[2],
  }
  const { zoom } = useViewport()
  const active = props.selected || !!props.data?.selectors.length
  return (
    <>
      <path
        d={path}
        fill="none"
        stroke="var(--canvas, #f6f5f9)"
        strokeWidth={7}
        className="wire-edge-halo"
      />
      <BaseEdge
        id={props.id}
        path={path}
        style={{ ...props.style, opacity: props.data?.muted ? 0.16 : 1 }}
        markerEnd={props.markerEnd}
        interactionWidth={24}
      />
      <EdgeLabelRenderer>
        <button
          type="button"
          aria-label={t('Select flow {{value}}: {{value2}}', {
            value: props.data?.number,
            value2: props.label || 'On click',
          })}
          title={String(props.label || 'On click')}
          onClick={props.data?.select}
          className={`wire-edge-label nodrag nopan${zoom < 0.7 && !active ? ' is-compact' : ''}${active ? ' is-active' : ''}${props.data?.muted ? ' is-muted' : ''}`}
          style={{
            transform: `translate(${labelX}px, ${labelY}px) scale(${1 / zoom}) translate(-50%, -50%)`,
          }}
        >
          <span>{props.data?.number}</span>
          <span className="wire-edge-text">{props.label || 'On click'}</span>
        </button>
        {!!props.data?.selectors.length && (
          <div
            className="edge-selection-presence"
            style={{
              transform: `translate(${labelX}px, ${labelY}px) scale(${1 / zoom}) translate(-50%, calc(-100% - 22px))`,
            }}
          >
            <SelectionBadges
              profiles={props.data.selectors}
              currentUserId={props.data.currentUserId}
            />
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  )
}
