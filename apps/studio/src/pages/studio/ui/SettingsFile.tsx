import { useEffect } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { LoadingStatus } from '@/shared/ui/index.tsx'
import { SettingsInvitations } from '@/widgets/collaboration/index.ts'
import type { StudioContentProps } from '../types/studioContentProps.ts'
import { SettingsMember } from './SettingsMember.tsx'
export function SettingsFile({
  settings,
  studio,
  multiplayer,
  state,
}: StudioContentProps) {
  const { t } = useTranslation()
  const { load } = settings
  useEffect(() => load(), [load])
  return (
    <>
      <header className="settings-section-heading">
        <h2>{studio.name}</h2>
        <p>{t('Control who can open and edit this file.')}</p>
      </header>
      <section className="settings-card">
        <header>
          <h3>{t('People with access')}</h3>
          <span>{settings.members.length}</span>
        </header>
        <p className="settings-description">
          {t(
            'Editors can change all pages. Viewers can browse and follow collaborators. Only owners manage access.',
          )}
        </p>
        {settings.error && (
          <div className="settings-error" role="alert">
            {t(settings.error)}
            <button
              className="button"
              disabled={settings.busy}
              onClick={settings.load}
            >
              {t('Retry')}
            </button>
          </div>
        )}
        {settings.loading ? (
          <LoadingStatus label={t('Loading members…')} />
        ) : (
          <ul className="settings-member-list">
            {settings.members.map((member) => (
              <SettingsMember
                key={member.id}
                member={member}
                settings={settings}
                currentUserId={multiplayer.profile.id}
              />
            ))}
          </ul>
        )}
      </section>
      {settings.role === 'owner' && (
        <section className="settings-card">
          <header>
            <h3>{t('Invitations')}</h3>
          </header>
          <p className="settings-description">
            {t(
              'New members join as Editors. You can change their role after they join.',
            )}
          </p>
          <SettingsInvitations
            workspaceId={studio.id}
            profile={multiplayer.profile}
            beforeLeave={state.flush}
          />
        </section>
      )}
    </>
  )
}
