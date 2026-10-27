import { useTranslation } from '@/shared/i18n/index.ts'
import { InvitationCard } from './InvitationCard.tsx'
import type { InvitationInboxContentProps } from '../types/invitationInboxContentProps.ts'
export function InvitationInboxContent({
  invitations,
  busy,
  error,
  message,
  loaded,
  decide,
}: InvitationInboxContentProps) {
  const { t } = useTranslation()
  return (
    <>
      <div className="invitation-inbox">
        {!loaded && <p>{t('Loading invitations…')}</p>}
        {loaded && !invitations.length && !error && (
          <p>{t('You are all caught up.')}</p>
        )}
        {invitations.map((item) => (
          <InvitationCard
            key={item.id}
            item={item}
            busy={busy}
            onDecision={decide}
          />
        ))}
      </div>
      {error && <p role="alert">{t(error)}</p>}
      {message && <p role="status">{t(message)}</p>}
    </>
  )
}
