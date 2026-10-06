import { Avatar } from '@/entities/collaboration/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useProfileFormHandlers } from '../model/useProfileFormHandlers.tsx'

import type { ProfileFormProps } from '../types/profileFormProps.ts'
export function ProfileForm({
  setBusy,
  setError,
  onProfile,
  setPanel,
  opener,
  profile,
  name,
  setAvatar,
  avatar,
  setName,
  busy,
}: ProfileFormProps) {
  const { t } = useTranslation()

  const { handleSubmit, handleUploadProfilePictureChange } =
    useProfileFormHandlers({
      setBusy,
      setError,
      name,
      avatar,
      onProfile,
      setPanel,
      opener,
      setAvatar,
    })
  return (
    <form onSubmit={handleSubmit}>
      <div className="profile-picture-editor">
        <Avatar profile={{ ...profile, name: name || profile.name, avatar }} />
        <label className="button">
          {t('Change picture')}
          <input
            aria-label={t('Upload profile picture')}
            className="visually-hidden"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleUploadProfilePictureChange}
          />
        </label>
        {avatar && (
          <button
            type="button"
            className="text-button"
            onClick={() => setAvatar('')}
          >
            {t('Remove')}
          </button>
        )}
      </div>
      <label>
        {t('Display name')}
        <input
          aria-label={t('Display name')}
          maxLength={60}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>
      <p className="collaboration-hint">
        {t('Your name and picture appear beside your cursor and in the team.')}
      </p>
      <button className="button primary" disabled={busy || !name.trim()}>
        {busy ? t('Saving…') : t('Save profile')}
      </button>
    </form>
  )
}
