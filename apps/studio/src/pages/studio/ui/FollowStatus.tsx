import { Avatar } from '@/entities/collaboration/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'

import type { FollowStatusProps } from '../types/followStatusProps.ts'
export function FollowStatus({ followed, setFollowId }: FollowStatusProps) {
  const { t } = useTranslation()

  return (
    <div
      className="follow-status"
      data-follow-controls
      role="status"
      style={{ borderColor: followed.profile.color }}
    >
      <Avatar profile={followed.profile} />
      <span>
        {t('Following')}
        <strong>{followed.profile.name}</strong>
      </span>
      <button onClick={() => setFollowId(null)}>{t('Stop following')}</button>
    </div>
  )
}
