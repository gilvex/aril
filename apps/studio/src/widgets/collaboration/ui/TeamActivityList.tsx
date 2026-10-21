import { Text } from '@/shared/ui/Text.tsx'
import type { TeamActivityListProps } from '../types/teamActivityListProps.ts'
export function TeamActivityList({ activity, t }: TeamActivityListProps) {
  return (
    <div className="team-activity-list">
      {!activity.length ? (
        <Text as="p">
          {t('No edits yet. Make a change to start the shared history.')}
        </Text>
      ) : (
        activity.map((item) => (
          <div key={item.id}>
            <span className="activity-seed" />
            <Text as="span">
              <Text as="strong">{item.name}</Text>
              <Text as="p">{item.message}</Text>
              <Text as="small">
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Text>
          </div>
        ))
      )}
    </div>
  )
}
