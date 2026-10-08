import { PeerCursor } from '@/entities/collaboration/index.ts'
import type { LiveCursorsProps } from '@/widgets/board/types/liveCursorsProps.ts'
import { SelectionBadges } from '@/widgets/board/ui/SelectionBadges.tsx'
import { ViewportPortal, useViewport } from '@xyflow/react'

export function LiveCursors({
  peers,
  nodes,
  profile,
  selectedIds,
}: LiveCursorsProps) {
  const { zoom } = useViewport()
  return (
    <ViewportPortal>
      {nodes.map((node) => {
        const selectors = [
          ...(selectedIds.has(node.id) ? [profile] : []),
          ...peers
            .filter((peer) => peer.selected.includes(node.id))
            .map((peer) => peer.profile),
        ]
        return selectors.length ? (
          <div
            className="node-selection-presence"
            key={node.id}
            style={{
              left: node.position.x,
              top: node.position.y - 8 / zoom,
              transform: `scale(${1 / zoom}) translateY(-100%)`,
            }}
          >
            <SelectionBadges profiles={selectors} currentUserId={profile.id} />
          </div>
        ) : null
      })}
      {peers.map((peer) => (
        <div key={peer.clientId}>
          {peer.cursor && (
            <PeerCursor
              key={peer.clientId}
              profile={peer.profile}
              chat={peer.chat}
              x={peer.cursor.x}
              y={peer.cursor.y}
              scale={1 / zoom}
            />
          )}
        </div>
      ))}
    </ViewportPortal>
  )
}
