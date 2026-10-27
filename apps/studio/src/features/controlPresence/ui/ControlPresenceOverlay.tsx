import { createPortal } from 'react-dom'
import { PeerCursor } from '@/entities/collaboration/index.ts'
import type { ControlPresenceProps } from '../types/controlPresenceProps.ts'
import { useControlBroadcast } from '../model/useControlBroadcast.ts'
import { useControlMarkers } from '../model/useControlMarkers.ts'
import './controlPresence.css'
export function ControlPresenceOverlay(props: ControlPresenceProps) {
  useControlBroadcast(props)
  const markers = useControlMarkers(props)
  if (!props.active) return null
  return createPortal(
    <div className="control-presence-overlay" aria-hidden="true">
      {markers.map(({ peer, pointer, focus, selection }) => (
        <div key={peer.clientId} style={{ color: peer.profile.color }}>
          {focus && (
            <div
              className="control-peer-focus"
              style={{
                left: focus.x,
                top: focus.y,
                width: focus.width,
                height: focus.height,
              }}
            >
              <span>{peer.profile.name}</span>
            </div>
          )}
          {selection.map((rect, index) => (
            <div
              key={index}
              className="control-peer-selection"
              style={{
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
              }}
            />
          ))}
          {pointer && (
            <PeerCursor
              profile={peer.profile}
              chat={peer.chat}
              x={pointer.x}
              y={pointer.y}
            />
          )}
        </div>
      ))}
    </div>,
    document.fullscreenElement || document.body,
  )
}
