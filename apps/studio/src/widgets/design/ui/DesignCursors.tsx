import { PeerCursor } from '@/entities/collaboration/index.ts'
import { ViewportPortal, useViewport } from '@xyflow/react'
import type { DesignCursorsProps } from '../types/designCursorsProps.ts'
export function DesignCursors({ peers }: DesignCursorsProps) {
  const { zoom } = useViewport()
  return (
    <ViewportPortal>
      {peers.map(
        (peer) =>
          peer.cursor &&
          !peer.controls?.pointer && (
            <PeerCursor
              key={peer.clientId}
              profile={peer.profile}
              chat={peer.chat}
              x={peer.cursor.x}
              y={peer.cursor.y}
              scale={1 / zoom}
            />
          ),
      )}
    </ViewportPortal>
  )
}
