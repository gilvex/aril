import { Text } from '@/shared/ui/Text.tsx'
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
        {!loaded && <Text as="p">{t('Loading invitations…')}</Text>}
        {loaded && !invitations.length && !error && (
          <Text as="p">{t('You are all caught up.')}</Text>
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
      {error && (
        <Text as="p" role="alert">
          {t(error)}
        </Text>
      )}
      {message && (
        <Text as="p" role="status">
          {t(message)}
        </Text>
      )}
    </>
  )
}
