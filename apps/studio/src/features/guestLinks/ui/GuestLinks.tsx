import { Text } from '@/shared/ui/Text.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { LoadingSkeleton, Spinner, StudioSelect } from '@/shared/ui/index.tsx'
import { useGuestLinks } from '../model/useGuestLinks.ts'
import type { GuestLinksProps } from '../types/guestLinksProps.ts'
import { GuestLinkList } from './GuestLinkList.tsx'
import './guestLinks.css'

export function GuestLinks({ workspaceId }: GuestLinksProps) {
  const { t } = useTranslation()
  const model = useGuestLinks(workspaceId)
  return (
    <section className="guest-links">
      <Text as="h3">{t('Guest links')}</Text>
      <Text as="p" className="collaboration-hint">
        {t(
          'Share all boards in this workspace without requiring an account. Choose viewing or editing access for each link. Revoke a link at any time.',
        )}
      </Text>
      <form onSubmit={model.create}>
        <Text as="label">
          {t('Link permissions')}
          <StudioSelect
            aria-label={t('Link permissions')}
            value={model.role}
            onChange={model.changeRole}
          >
            <option value="viewer">{t('View only')}</option>
            <option value="member">{t('Can edit')}</option>
          </StudioSelect>
        </Text>
        <Text as="label">
          {t('Link name')}
          <input
            value={model.name}
            onChange={model.changeName}
            maxLength={60}
            required
            placeholder={t('For example: design review')}
          />
        </Text>
        <Text as="label">
          {t('Access duration')}
          <Text
            as="span"
            className={
              model.unit === 0
                ? 'guest-duration guest-duration-unlimited'
                : 'guest-duration'
            }
          >
            {model.unit !== 0 && (
              <input
                aria-label={t('Duration')}
                type="number"
                min={Math.ceil(5 / model.unit)}
                max={Math.floor(43200 / model.unit)}
                step={1}
                value={model.duration}
                onChange={model.changeDuration}
                required
              />
            )}
            <StudioSelect
              aria-label={t('Duration unit')}
              value={String(model.unit)}
              onChange={model.changeUnit}
            >
              <option value="0">{t('No expiration')}</option>
              <option value="1">{t('Minutes')}</option>
              <option value="60">{t('Hours')}</option>
              <option value="1440">{t('Days')}</option>
            </StudioSelect>
          </Text>
        </Text>
        <Text as="small">
          {t(
            model.unit === 0
              ? 'Works until you revoke it.'
              : '5 minutes to 30 days, starting now.',
          )}
        </Text>
        <button className="button" disabled={model.busy}>
          {model.busy && <Spinner />}
          <Text>{t('Create guest link')}</Text>
        </button>
      </form>
      {model.url && (
        <Text as="label" className="invite-output">
          {t('Guest link')}
          <input
            aria-label={t('Guest link')}
            readOnly
            value={model.url}
            onFocus={(event) => event.target.select()}
          />
          <button className="button" onClick={model.copy}>
            <Text>{model.copied ? t('Copied') : t('Copy link')}</Text>
          </button>
        </Text>
      )}
      {model.loading && <LoadingSkeleton label={t('Loading…')} />}
      <GuestLinkList
        links={model.links}
        busy={model.busy}
        revoke={model.revoke}
      />
      {model.error && (
        <Text as="p" className="form-error" role="alert">
          {model.error}
        </Text>
      )}
    </section>
  )
}
