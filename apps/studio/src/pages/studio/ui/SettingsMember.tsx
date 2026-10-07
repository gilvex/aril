import { useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { Avatar } from '@/entities/collaboration/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { StudioSelect, Spinner } from '@/shared/ui/index.tsx'
import type { SettingsMemberProps } from '../types/settingsMemberProps.ts'
export function SettingsMember({
  member,
  settings,
  currentUserId,
}: SettingsMemberProps) {
  const { t } = useTranslation()
  const { set, changeMember } = settings
  const changeRole = useCallback(
    (event: { target: { value: string } }) => {
      changeMember(member.id, event.target.value as 'member' | 'viewer')
    },
    [changeMember, member.id],
  )
  const askRemove = useCallback(
    () => set({ confirming: member.id }),
    [set, member.id],
  )
  const remove = useCallback(
    () => changeMember(member.id),
    [changeMember, member.id],
  )
  const cancel = useCallback(() => set({ confirming: null }), [set])
  const manageable = settings.role === 'owner' && member.role !== 'owner'
  return (
    <li className="settings-member">
      <div className="settings-member-identity">
        <Avatar profile={member} />
        <div>
          <strong>
            {member.name}
            {member.id === currentUserId && <small> · {t('You')}</small>}
          </strong>
          <small>
            {t(
              member.role === 'owner'
                ? 'Owner'
                : member.role === 'viewer'
                  ? 'Can view and follow'
                  : member.role === 'guest'
                    ? 'Temporary guest'
                    : 'Can edit this file',
            )}
          </small>
        </div>
      </div>
      {settings.confirming === member.id ? (
        <div className="settings-remove-confirm" role="alert">
          <span>
            {t('Remove {{name}} from this file?', { name: member.name })}
          </span>
          <button
            className="button danger"
            disabled={settings.busy}
            onClick={remove}
          >
            {settings.busy && <Spinner />}
            {t('Remove')}
          </button>
          <button className="button" disabled={settings.busy} onClick={cancel}>
            {t('Cancel')}
          </button>
        </div>
      ) : (
        <div className="settings-member-actions">
          {manageable && member.role !== 'guest' ? (
            <StudioSelect
              aria-label={t('Access for {{name}}', { name: member.name })}
              value={member.role}
              onChange={changeRole}
              disabled={settings.busy}
            >
              <option value="member">{t('Editor')}</option>
              <option value="viewer">{t('Viewer')}</option>
            </StudioSelect>
          ) : (
            <span className="settings-role">
              {t(
                member.role === 'owner'
                  ? 'Owner'
                  : member.role === 'viewer'
                    ? 'Viewer'
                    : member.role === 'guest'
                      ? 'Guest'
                      : 'Editor',
              )}
            </span>
          )}
          {manageable && (
            <button
              className="icon-button"
              disabled={settings.busy}
              onClick={askRemove}
              title={t('Remove member')}
              aria-label={t('Remove {{name}}', { name: member.name })}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
    </li>
  )
}
