import { useTranslation } from '@/shared/i18n/index.ts'
import { useFollowPersonHandlers } from '../model/useFollowPersonHandlers.tsx'

import { Avatar } from '@/entities/collaboration/index.ts'

import type { FollowPersonProps } from '../types/followPersonProps.ts'
export function FollowPerson({
  person,
  connected,
  followId,
  onFollow,
  setPanel,
  profile,
}: FollowPersonProps) {
  const { t } = useTranslation()

  const { handleClick } = useFollowPersonHandlers({
    onFollow,
    followId,
    person,
    setPanel,
  })
  return (
    <button
      className="follow-person"
      key={person.clientId}
      disabled={person.clientId === 'self' || !!person.following || !connected}
      aria-label={
        person.clientId === 'self'
          ? t('{{name}} (you)', { name: person.profile.name })
          : t('Follow {{name}}', { name: person.profile.name })
      }
      aria-pressed={followId === person.clientId}
      onClick={handleClick}
    >
      <Avatar profile={person.profile} />
      <span>
        <strong>
          {person.profile.name}
          {person.clientId === 'self'
            ? t(' (you)')
            : person.profile.id === profile.id
              ? t(' (another tab)')
              : ''}
        </strong>
        <small>
          {person.clientId === 'self'
            ? t('This browser')
            : person.following
              ? t('Following another person')
              : person.view === 'canvas'
                ? t('On the canvas')
                : t('Viewing {{value}}', { value: person.view })}
        </small>
      </span>
      {person.clientId !== 'self' && !person.following && (
        <small>
          {followId === person.clientId ? t('Following') : t('Follow')}
        </small>
      )}
    </button>
  )
}
