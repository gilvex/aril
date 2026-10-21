import { isProductSiteEnabled } from '@/shared/deploymentSettings/index.ts'
import { GuestJoinScreen } from './GuestJoinScreen.tsx'
import { InstallApp } from '@/features/installApp/index.ts'
import { ProjectLinks } from '@/shared/ui/index.tsx'
import type { JoinStudioScreenProps } from '../types/joinStudioScreenProps.ts'
import { LoginHeader } from './LoginHeader.tsx'
import { LoginBlueprint } from './LoginBlueprint.tsx'
import { LoginAuth } from './LoginAuth.tsx'
import './loginScreen.css'

export function JoinStudioScreen(props: JoinStudioScreenProps) {
  const { token } = props
  const productSite = isProductSiteEnabled()
  if (token.startsWith('guest:')) return <GuestJoinScreen {...props} />
  return (
    <div className="login-screen">
      <LoginHeader />
      <main className="login-layout">
        <LoginAuth {...props} />
        <LoginBlueprint />
      </main>
      <footer className="login-footer">
        <ProjectLinks />
        {productSite && <InstallApp />}
      </footer>
    </div>
  )
}
