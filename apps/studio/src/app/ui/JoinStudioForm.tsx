import { Text } from '@/shared/ui/Text.tsx'
import { getProductBranding } from '@/shared/deploymentSettings/index.ts'
import { Spinner } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useJoinStudioFormHandlers } from '../model/useJoinStudioFormHandlers.tsx'

import type { JoinStudioFormProps } from '../types/joinStudioFormProps.ts'
export function JoinStudioForm({
  setBusy,
  setError,
  token,
  profile,
  name,
  setProfile,
  setInviteRequired,
  setToken,
  busy,
}: JoinStudioFormProps) {
  const { t } = useTranslation()

  const { handleSubmit } = useJoinStudioFormHandlers({
    setBusy,
    setError,
    token,
    profile,
    name,
    setProfile,
    setInviteRequired,
    setToken,
  })
  return (
    <form className="join-form" onSubmit={handleSubmit}>
      <Text as="p">
        {t('Join {{product}} with an invitation from someone in the studio.', {
          product: getProductBranding().productName,
        })}
      </Text>
      <Text as="label">
        {t('Invite code')}
        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
          autoComplete="off"
        />
      </Text>
      <button
        className="button primary"
        disabled={busy || !profile || !token.trim()}
      >
        {busy && <Spinner />}
        <Text>{busy
          ? t('Joining…')
          : profile
            ? t('Accept invitation as {{name}}', { name: profile.name })
            : t('Join studio')}</Text>
      </button>
    </form>
  )
}
