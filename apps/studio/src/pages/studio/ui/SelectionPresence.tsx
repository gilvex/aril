import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useViewport, type Edge, type EdgeProps } from '@xyflow/react'
import type { Profile } from '@pomegranate/domain/collaboration'
import { Avatar } from './CollaborationBar'

export function SelectionBadges({ profiles, currentUserId }: { profiles: Profile[]; currentUserId: string }) {
  const people = [...new Map(profiles.map((profile) => [profile.id, profile])).values()]
  return (
    <div className="selection-badges" aria-label={`Selected by ${people.map((person) => person.name).join(', ')}`}>
      {people.map((person) => (
        <span className="selection-person" key={person.id} style={{ borderColor: person.color }}>
          <Avatar profile={person} />
          <span>{person.name}{person.id === currentUserId ? ' (you)' : ''}</span>
        </span>
      ))}
    </div>
  )
}

type SharedEdge = Edge<{ selectors: Profile[]; currentUserId: string }, 'smoothstep'>

export function SelectionEdge(props: EdgeProps<SharedEdge>) {
  const [path, labelX, labelY] = getSmoothStepPath(props)
  const { zoom } = useViewport()
  return (
    <>
      <BaseEdge
        id={props.id} path={path} labelX={labelX} labelY={labelY}
        label={props.label} labelStyle={props.labelStyle} style={props.style}
        markerStart={props.markerStart} markerEnd={props.markerEnd}
        interactionWidth={props.interactionWidth}
      />
      {!!props.data?.selectors.length && (
        <EdgeLabelRenderer>
          <div className="edge-selection-presence" style={{ transform: `translate(${labelX}px, ${labelY}px) scale(${1 / zoom}) translate(-50%, calc(-100% - 14px))` }}>
            <SelectionBadges profiles={props.data.selectors} currentUserId={props.data.currentUserId} />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
