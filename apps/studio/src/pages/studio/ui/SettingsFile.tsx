import { Text } from '@/shared/ui/Text.tsx'
import { SettingsFileActions } from './SettingsFileActions.tsx'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
import { useEffect } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { LoadingSkeleton } from '@/shared/ui/index.tsx'
import { SettingsInvitations } from '@/widgets/collaboration/index.ts'
import type { StudioContentProps } from '../types/studioContentProps.ts'
import { SettingsMember } from './SettingsMember.tsx'
export function SettingsFile(props: StudioContentProps) {
  const { settings, studio, multiplayer, state } = props
  const { t } = useTranslation()
  const { load } = settings
  useEffect(() => load(), [load])
  return (
    <>
      <header className="settings-section-heading">
        <div className="settings-file-title">
          <Text as="h2">{studio.name}</Text>
          {settings.role === 'owner' && !isDemoMode() && (
            <SettingsFileActions {...props} />
          )}
        </div>
        <Text as="p">{t('Control who can open and edit this file.')}</Text>
      </header>
      <section className="settings-card">
        <header>
          <Text as="h3">{t('People with access')}</Text>
          <Text as="span">{settings.members.length}</Text>
        </header>
        <Text as="p" className="settings-description">
          {t(
            'Editors can change all pages. Viewers can browse and follow collaborators. Only owners manage access.',
          )}
        </Text>
        {settings.error && (
          <div className="settings-error" role="alert">
            <Text>{t(settings.error)}</Text>
            <button
              className="button"
              disabled={settings.busy}
              onClick={settings.load}
            >
              <Text>{t('Retry')}</Text>
            </button>
          </div>
        )}
        {settings.loading ? (
          <LoadingSkeleton label={t('Loading members…')} />
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
            <Text as="h3">{t('Invitations')}</Text>
          </header>
          <Text as="p" className="settings-description">
            {t(
              'New members join as Editors. You can change their role after they join.',
            )}
          </Text>
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
