import { Menu } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { StudioBottomNavigationProps } from '../types/studioBottomNavigationProps.ts'
export function StudioMobileMenuButton({
  mobileMenuToggle,
  sidebarOpen,
  setSidebarOpen,
}: Pick<
  StudioBottomNavigationProps,
  'mobileMenuToggle' | 'sidebarOpen' | 'setSidebarOpen'
>) {
  const { t } = useTranslation()
  return (
    <button
      ref={mobileMenuToggle}
      aria-label={t('Open workspace menu')}
      aria-expanded={sidebarOpen}
      aria-controls="studio-navigation"
      onClick={() => setSidebarOpen(true)}
    >
      <Menu size={21} />
      <span>{t('Menu')}</span>
    </button>
  )
}
