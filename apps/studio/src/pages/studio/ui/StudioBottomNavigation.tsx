import { PresenceAvatars } from '@/entities/collaboration/index.ts'
import { navigation } from '@/pages/studio/config/navigation.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { Menu } from 'lucide-react'

import type { StudioBottomNavigationProps } from '../types/studioBottomNavigationProps.ts'
export function StudioBottomNavigation({
  view,
  setView,
  setSidebarOpen,
  present,
  mobileMenuToggle,
  sidebarOpen,
}: StudioBottomNavigationProps) {
  const { t } = useTranslation()

  return (
    <nav className="mobile-bottom-nav" aria-label={t('Main navigation')}>
      {navigation.map((item) => (
        <button
          key={item.id}
          aria-label={t(item.name)}
          aria-current={view === item.id ? 'page' : undefined}
          onClick={() => {
            setView(item.id)
            setSidebarOpen(false)
          }}
        >
          <item.icon size={21} />
          <span>
            {item.id === 'requirements'
              ? t('Brief')
              : item.id === 'design'
                ? t('Design')
                : item.id === 'notes'
                  ? t('Notes')
                  : t('Canvas')}
          </span>
          <PresenceAvatars
            profiles={present
              .filter(
                (person) =>
                  (person.view === item.id &&
                    !(item.id === 'design' && person.boardId)) ||
                  (item.id === 'canvas' &&
                    (person.view === 'wireframes' ||
                      (person.view === 'design' && !!person.boardId))),
              )
              .map((person) => person.profile)}
          />
        </button>
      ))}
      <button
        ref={mobileMenuToggle}
        aria-label={t('Open workspace menu')}
        aria-expanded={sidebarOpen}
        aria-controls="studio-navigation"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={21} />
        <span>{t('More')}</span>
      </button>
    </nav>
  )
}
