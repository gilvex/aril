import { UsernameEditor } from '@/features/invitations/index.ts'
import { AccountActions } from '@/features/accountActions/index.ts'
import { ProjectLinks } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { InvitationProfileProps } from '@/features/invitations/index.ts'
import { LoginHeader } from './LoginHeader.tsx'
import './loginScreen.css'
import './usernameSetup.css'

export function UsernameSetup(props: InvitationProfileProps) {
  const { t } = useTranslation()
  return (
    <div className="login-screen username-setup">
      <LoginHeader />
      <main className="username-setup-card">
        <p className="username-setup-eyebrow">{t('Your account')}</p>
        <h1>{t('Choose your username')}</h1>
        <p>
          {t(
            'Make it easy for teammates to find you. Keep our suggestion or write your own.',
          )}
        </p>
        <UsernameEditor {...props} setup />
        <p>{t('You can change it later in Account settings.')}</p>
        <AccountActions />
      </main>
      <footer className="login-footer">
        <ProjectLinks />
      </footer>
    </div>
  )
}
