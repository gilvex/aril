import type { TeamActivityListProps } from '../types/teamActivityListProps.ts'
export function TeamActivityList({ activity, t }: TeamActivityListProps) {
  return (
    <div className="team-activity-list">
      {!activity.length ? (
        <p>{t('No edits yet. Make a change to start the shared history.')}</p>
      ) : (
        activity.map((item) => (
          <div key={item.id}>
            <span className="activity-seed" />
            <span>
              <strong>{item.name}</strong>
              <p>{item.message}</p>
              <small>
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </small>
            </span>
          </div>
        ))
      )}
    </div>
  )
}
