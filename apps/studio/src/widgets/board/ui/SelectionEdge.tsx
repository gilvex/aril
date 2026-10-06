import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useViewport,
  type EdgeProps,
} from '@xyflow/react'
import type { SharedEdge } from '../types/sharedEdge.ts'
import { SelectionBadges } from './SelectionBadges.tsx'
export function SelectionEdge(props: EdgeProps<SharedEdge>) {
  const [path, labelX, labelY] = getSmoothStepPath(props)
  const { zoom } = useViewport()
  return (
    <>
      <BaseEdge
        id={props.id}
        path={path}
        labelX={labelX}
        labelY={labelY}
        label={props.label}
        labelStyle={props.labelStyle}
        style={props.style}
        markerStart={props.markerStart}
        markerEnd={props.markerEnd}
        interactionWidth={props.interactionWidth}
      />
      {!!props.data?.selectors.length && (
        <EdgeLabelRenderer>
          <div
            className="edge-selection-presence"
            style={{
              transform: `translate(${labelX}px, ${labelY}px) scale(${1 / zoom}) translate(-50%, calc(-100% - 14px))`,
            }}
          >
            <SelectionBadges
              profiles={props.data.selectors}
              currentUserId={props.data.currentUserId}
            />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
