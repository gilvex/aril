import { Text } from '@/shared/ui/Text.tsx'
import { productVersion } from '@/shared/config/index.ts'
import { AgentAccess } from '@/features/agentAccess/index.ts'
import { useCallback } from 'react'
import { File, User, SlidersHorizontal, Bot } from 'lucide-react'
import {
  AccentPicker,
  LanguagePicker,
  ThemePicker,
} from '@/features/appearance/index.ts'
import { InstallApp } from '@/features/installApp/index.ts'
import { SettingsProfile } from '@/widgets/collaboration/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { StudioContentProps } from '../types/studioContentProps.ts'
import { SettingsFile } from './SettingsFile.tsx'
import { ProjectLinks } from '@/shared/ui/index.tsx'
import './studioSettings.css'
export function StudioSettings(props: StudioContentProps) {
  const { t } = useTranslation()
  const { settings, multiplayer, state } = props
  const { set } = settings
  const agents = useCallback(() => set({ section: 'agents' }), [set])
  const file = useCallback(() => set({ section: 'file' }), [set])
  const user = useCallback(() => set({ section: 'user' }), [set])
  const app = useCallback(() => set({ section: 'app' }), [set])
  return (
    <section className="studio-settings" data-collaboration-private>
      <div className="settings-layout">
        <aside className="settings-sidebar">
          <header className="settings-heading">
            <Text as="h1">{t('Settings')}</Text>
          </header>
          <nav
            className="settings-navigation"
            aria-label={t('Settings sections')}
          >
            <button
              aria-current={settings.section === 'file' ? 'page' : undefined}
              onClick={file}
            >
              <File size={18} />
              <Text>{t('File')}</Text>
            </button>
            <button
              aria-current={settings.section === 'user' ? 'page' : undefined}
              onClick={user}
            >
              <User size={18} />
              <Text>{t('User')}</Text>
            </button>
            <button
              aria-current={settings.section === 'app' ? 'page' : undefined}
              onClick={app}
            >
              <SlidersHorizontal size={18} />
              <Text>{t('App')}</Text>
            </button>
            <button
              aria-current={settings.section === 'agents' ? 'page' : undefined}
              onClick={agents}
            >
              <Bot size={18} />
              <Text>{t('Agent access')}</Text>
            </button>
          </nav>
        </aside>
        <div className="settings-content">
          <div className="settings-content-inner">
            {settings.section === 'agents' && (
              <section className="settings-card">
                <AgentAccess workspaceId={props.studio.id} />
              </section>
            )}
            {settings.section === 'file' && <SettingsFile {...props} />}
            {settings.section === 'user' && (
              <>
                <header className="settings-section-heading">
                  <Text as="h2">{t('Your profile')}</Text>
                  <Text as="p">
                    {t('This profile is shared across your workspaces.')}
                  </Text>
                </header>
                <section className="settings-card">
                  <SettingsProfile
                    profile={multiplayer.profile}
                    onProfile={multiplayer.setProfile}
                    beforeLeave={state.flush}
                  />
                </section>
              </>
            )}
            {settings.section === 'app' && (
              <>
                <header className="settings-section-heading">
                  <Text as="h2">{t('App preferences')}</Text>
                  <Text as="p">{t('Saved on this device.')}</Text>
                </header>
                <section className="settings-card settings-preferences">
                  <ThemePicker />
                  <LanguagePicker />
                  <AccentPicker />
                  <InstallApp />
                </section>
                <Text as="p" className="settings-product-version">
                  {t('Version {{version}}', { version: productVersion })}
                </Text>
                <ProjectLinks />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
