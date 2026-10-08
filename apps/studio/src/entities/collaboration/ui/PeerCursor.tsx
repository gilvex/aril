import { useTranslation } from '@/shared/i18n/index.ts'
import type { PeerCursorProps } from '../types/peerCursorProps.ts'
import { CursorMessage } from './CursorMessage.tsx'
export function PeerCursor({
  profile,
  chat,
  x,
  y,
  scale = 1,
}: PeerCursorProps) {
  const { t } = useTranslation()
  return (
    <div
      className="peer-cursor"
      aria-label={t('{{name}} cursor', { name: profile.name })}
      style={{
        translate: `${x}px ${y}px`,
        transform: `scale(${scale})`,
        color: profile.color,
      }}
    >
      <svg width="19" height="23" viewBox="0 0 19 23" aria-hidden="true">
        <path
          d="M1 1L17 12L9 13L6 21Z"
          fill="currentColor"
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      <span className="peer-cursor-label" style={{ background: profile.color }}>
        {profile.avatar && <img src={profile.avatar} alt="" />}
        <strong>{profile.name}</strong>
        <CursorMessage chat={chat} />
      </span>
    </div>
  )
}
