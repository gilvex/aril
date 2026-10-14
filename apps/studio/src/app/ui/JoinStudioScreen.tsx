import { GuestJoinScreen } from './GuestJoinScreen.tsx'
import { InstallApp } from '@/features/installApp/index.ts'
import { ProjectLinks } from '@/shared/ui/index.tsx'
import { LandingPage } from '@/pages/landing/index.ts'
import type { JoinStudioScreenProps } from '../types/joinStudioScreenProps.ts'
import { LoginHeader } from './LoginHeader.tsx'
import { LoginBlueprint } from './LoginBlueprint.tsx'
import { LoginAuth } from './LoginAuth.tsx'
import './loginScreen.css'

export function JoinStudioScreen(props: JoinStudioScreenProps) {
  const { token, profile } = props
  const switching =
    new URLSearchParams(location.search).get('account') === 'switch'
  if (token.startsWith('guest:')) return <GuestJoinScreen {...props} />
  if (!profile && !token && !switching)
    return (
      <LandingPage>
        <LoginAuth {...props} heading="h2" />
      </LandingPage>
    )
  return (
    <div className="login-screen">
      <LoginHeader />
      <main className="login-layout">
        <LoginAuth {...props} />
        <LoginBlueprint />
      </main>
      <footer className="login-footer">
        <ProjectLinks />
        <InstallApp />
      </footer>
    </div>
  )
}
