import { useTranslation } from '@/shared/i18n/index.ts'
import { LoadingSkeleton, Spinner, StudioSelect } from '@/shared/ui/index.tsx'
import { useGuestLinks } from '../model/useGuestLinks.ts'
import type { GuestLinksProps } from '../types/guestLinksProps.ts'
import './guestLinks.css'

export function GuestLinks({ workspaceId }: GuestLinksProps) {
  const { t, i18n } = useTranslation()
  const model = useGuestLinks(workspaceId)
  return (
    <section className="guest-links">
      <h3>{t('Temporary guest links')}</h3>
      <p className="collaboration-hint">
        {t(
          'Anyone with the link can edit this workspace without Google until it expires. Guests cannot invite others. Revoke to end access for everyone using this link.',
        )}
      </p>
      <form onSubmit={model.create}>
        <label>
          {t('Link name')}
          <input
            value={model.name}
            onChange={model.changeName}
            maxLength={60}
            required
            placeholder={t('For example: design review')}
          />
        </label>
        <label>
          {t('Access duration')}
          <span className="guest-duration">
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
            <StudioSelect
              aria-label={t('Duration unit')}
              value={String(model.unit)}
              onChange={model.changeUnit}
            >
              <option value="1">{t('Minutes')}</option>
              <option value="60">{t('Hours')}</option>
              <option value="1440">{t('Days')}</option>
            </StudioSelect>
          </span>
        </label>
        <small>{t('5 minutes to 30 days, starting now.')}</small>
        <button className="button" disabled={model.busy}>
          {model.busy && <Spinner />}
          {t('Create guest link')}
        </button>
      </form>
      {model.url && (
        <label className="invite-output">
          {t('Guest link')}
          <input
            aria-label={t('Guest link')}
            readOnly
            value={model.url}
            onFocus={(event) => event.target.select()}
          />
          <button className="button" onClick={model.copy}>
            {model.copied ? t('Copied') : t('Copy link')}
          </button>
        </label>
      )}
      {model.loading && <LoadingSkeleton label={t('Loading…')} />}
      <ul className="guest-link-list">
        {model.links.map((link) => (
          <li key={link.id}>
            <div>
              <strong>{link.name}</strong>
              <small>
                {link.revoked
                  ? t('Revoked')
                  : link.expiresAt <= Date.now()
                    ? t('Expired')
                    : t('Expires {{time}}', {
                        time: new Date(link.expiresAt).toLocaleString(
                          i18n.language,
                        ),
                      })}
              </small>
              <small>
                {t('Guest visits: {{count}}', { count: link.guests })}
              </small>
            </div>
            {!link.revoked && link.expiresAt > Date.now() && (
              <button
                className="button"
                data-link-id={link.id}
                disabled={model.busy}
                onClick={model.revoke}
              >
                {t('Revoke')}
              </button>
            )}
          </li>
        ))}
      </ul>
      {model.error && (
        <p className="form-error" role="alert">
          {model.error}
        </p>
      )}
    </section>
  )
}
