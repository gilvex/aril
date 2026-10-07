import { useCallback, useRef } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCollaborationBarModel } from '../model/useCollaborationBarModel.ts'
import { createCollaborationBarState } from '../model/createCollaborationBarState.ts'
import { PeopleInvites } from './PeopleInvites.tsx'
import type { SettingsInvitationsProps } from '../types/settingsInvitationsProps.ts'
export function SettingsInvitations(props: SettingsInvitationsProps) {
  const { t } = useTranslation()
  const model = useCollaborationBarModel(() =>
    createCollaborationBarState(props.profile),
  )
  const opener = useRef<HTMLElement | null>(null)
  const noop = useCallback(() => {}, [])
  return (
    <div className="settings-invitations">
      <PeopleInvites
        {...props}
        {...model}
        panel="people"
        setPanel={noop}
        opener={opener}
        onProfile={noop}
        peers={[]}
        connected
        followId={null}
        onFollow={noop}
        activity={[]}
      />
      {model.error && <p role="alert">{t(model.error)}</p>}
    </div>
  )
}
