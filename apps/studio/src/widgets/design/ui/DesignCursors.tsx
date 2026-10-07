import { ViewportPortal, useViewport } from '@xyflow/react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignCursorsProps } from '../types/designCursorsProps.ts'
export function DesignCursors({ peers }: DesignCursorsProps) {
  const { zoom } = useViewport()
  const { t } = useTranslation()
  return (
    <ViewportPortal>
      {peers.map(
        (peer) =>
          peer.cursor && (
            <div
              className="peer-cursor"
              key={peer.clientId}
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
            </div>
          ),
      )}
    </ViewportPortal>
  )
}
