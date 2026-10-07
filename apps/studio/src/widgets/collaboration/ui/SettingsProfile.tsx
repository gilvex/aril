import { useCallback, useRef } from 'react'
import { AccountActions } from '@/features/accountActions/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCollaborationBarModel } from '../model/useCollaborationBarModel.ts'
import { createCollaborationBarState } from '../model/createCollaborationBarState.ts'
import { ProfileForm } from './ProfileForm.tsx'
import { AccountConnection } from './AccountConnection.tsx'
import type { SettingsProfileProps } from '../types/settingsProfileProps.ts'
export function SettingsProfile(props: SettingsProfileProps) {
  const { t } = useTranslation()
  const model = useCollaborationBarModel(() =>
    createCollaborationBarState(props.profile),
  )
  const opener = useRef<HTMLElement | null>(null)
  const setPanel = useCallback(() => {}, [])
  return (
    <div className="settings-profile">
      <ProfileForm {...model} {...props} opener={opener} setPanel={setPanel} />
      {model.error && <p role="alert">{t(model.error)}</p>}
      <div className="settings-account">
        <h3>{t('Account')}</h3>
        <AccountConnection onProfile={props.onProfile} />
        <AccountActions beforeLeave={props.beforeLeave} />
      </div>
    </div>
  )
}
