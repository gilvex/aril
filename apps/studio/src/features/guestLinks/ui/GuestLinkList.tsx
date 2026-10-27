import { Text } from '@/shared/ui/Text.tsx'
import { guestLinkNoExpiry } from '@aril/domain/collaboration'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { GuestLinkListProps } from '../types/guestLinkListProps.ts'

export function GuestLinkList({ links, busy, revoke }: GuestLinkListProps) {
  const { t, i18n } = useTranslation()
  return (
    <ul className="guest-link-list">
      {links.map((link) => (
        <li key={link.id}>
          <div>
            <Text as="strong">{link.name}</Text>
            <Text as="small">
              {t(link.role === 'viewer' ? 'View only' : 'Can edit')}
            </Text>
            <Text as="small">
              {link.expiresAt === guestLinkNoExpiry
                ? t('No expiration')
                : link.expiresAt <= Date.now()
                  ? t('Expired')
                  : t('Expires {{time}}', {
                      time: new Date(link.expiresAt).toLocaleString(
                        i18n.language,
                      ),
                    })}
            </Text>
            <Text as="small">
              {t('Guest visits: {{count}}', { count: link.guests })}
            </Text>
          </div>
          {!link.revoked && link.expiresAt > Date.now() && (
            <button
              className="button"
              data-link-id={link.id}
              disabled={busy}
              onClick={revoke}
            >
              <Text>{t('Revoke')}</Text>
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
