import { Text } from '@/shared/ui/Text.tsx'
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
      <Text as="span">
        {t('Following')} <Text as="strong">{followed.profile.name}</Text>
      </Text>
      <button onClick={() => setFollowId(null)}>
        <Text>{t('Stop following')}</Text>
      </button>
    </div>
  )
}
