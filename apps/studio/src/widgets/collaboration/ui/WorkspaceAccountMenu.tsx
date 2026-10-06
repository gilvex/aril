import { ChevronDown } from 'lucide-react'
import { Avatar } from '@/entities/collaboration/index.ts'
import { AccountActions } from '@/features/accountActions/index.ts'
import { LanguagePicker, ThemePicker } from '@/features/appearance/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { AccountConnection } from './AccountConnection.tsx'
import type { WorkspaceAccountMenuProps } from '../types/workspaceAccountMenuProps.ts'

export function WorkspaceAccountMenu({
  profile,
  onProfile,
}: WorkspaceAccountMenuProps) {
  const { t } = useTranslation()
  return (
    <details className="workspace-account">
      <summary aria-label={t('Your account')}>
        <Avatar profile={profile} />
        <span>{profile.name}</span>
        <ChevronDown size={15} />
      </summary>
      <div className="workspace-account-panel">
        <ThemePicker />
        <LanguagePicker />
        <AccountConnection onProfile={onProfile} />
        <AccountActions />
      </div>
    </details>
  )
}
