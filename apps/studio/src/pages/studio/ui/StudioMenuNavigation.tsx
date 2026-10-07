import { useCallback, type MouseEvent } from 'react'
import { navigation } from '../config/navigation.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { StudioMobileMenuProps } from '../types/studioMobileMenuProps.ts'
export function StudioMenuNavigation({
  setView,
  setSidebarOpen,
}: Pick<StudioMobileMenuProps, 'setView' | 'setSidebarOpen'>) {
  const { t } = useTranslation()
  const navigate = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setView(
        event.currentTarget.dataset.view as (typeof navigation)[number]['id'],
      )
      setSidebarOpen(false)
    },
    [setView, setSidebarOpen],
  )
  return (
    <div
      className="mobile-workspace-tools"
      role="navigation"
      aria-label={t('Main navigation')}
    >
      {navigation.map(({ id, name, icon: Icon }) => (
        <button key={id} data-view={id} onClick={navigate}>
          <Icon size={18} />
          {t(name)}
        </button>
      ))}
    </div>
  )
}
