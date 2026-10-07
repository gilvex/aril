import { CursorMessage } from '@/entities/collaboration/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { LiveCursorsProps } from '@/widgets/board/types/liveCursorsProps.ts'
import { SelectionBadges } from '@/widgets/board/ui/SelectionBadges.tsx'
import { ViewportPortal, useViewport } from '@xyflow/react'

export function LiveCursors({
  peers,
  nodes,
  profile,
  selectedIds,
}: LiveCursorsProps) {
  const { t } = useTranslation()

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
            <div
              className="peer-cursor"
              aria-label={t('{{name}} cursor', { name: peer.profile.name })}
              style={{
                translate: `${peer.cursor.x}px ${peer.cursor.y}px`,
                transform: `scale(${1 / zoom})`,
                color: peer.profile.color,
              }}
            >
              <svg
                width="19"
                height="23"
                viewBox="0 0 19 23"
                aria-hidden="true"
              >
                <path
                  d="M1 1L17 12L9 13L6 21Z"
                  fill="currentColor"
                  stroke="white"
                  strokeWidth="1.5"
                />
              </svg>
              <span style={{ background: peer.profile.color }}>
                {peer.profile.avatar && (
                  <img src={peer.profile.avatar} alt="" />
                )}
                {peer.profile.name}
              </span>
              <CursorMessage chat={peer.chat} />
            </div>
          )}
        </div>
      ))}
    </ViewportPortal>
  )
}
