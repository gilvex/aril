import { InstallApp } from '@/features/installApp/index.ts'
import { LanguagePicker } from '@/features/appearance/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useStudioDesktopNavigationHandlers } from '../model/useStudioDesktopNavigationHandlers.tsx'

import { PresenceAvatars } from '@/entities/collaboration/index.ts'
import { ThemePicker } from '@/features/appearance/index.ts'
import { navigation } from '@/pages/studio/config/navigation.ts'
import {
  Activity as ActivityIcon,
  Download,
  History,
  MoreHorizontal,
  Upload,
  Workflow,
} from 'lucide-react'

import type { StudioDesktopNavigationProps } from '../types/studioDesktopNavigationProps.ts'
export function StudioDesktopNavigation({
  view,
  setView,
  setRequirementId,
  present,
  actionsMenu,
  setCollaborationPanel,
  setModal,
  loadHistory,
  importRef,
  exportWorkspace,
}: StudioDesktopNavigationProps) {
  const { t } = useTranslation()

  const { dismissActionsMenu, openTeamActivity } =
    useStudioDesktopNavigationHandlers({
      actionsMenu,
      setCollaborationPanel,
    })
  return (
    <div className="header-navigation">
      <nav className="desktop-page-nav" aria-label={t('Main navigation')}>
        {navigation.map(({ icon: Icon, ...item }) => (
          <button
            key={item.id}
            aria-label={t(item.name)}
            title={t(item.name)}
            aria-current={view === item.id ? 'page' : undefined}
            onClick={() => {
              setView(item.id)
              if (item.id === 'requirements') setRequirementId(null)
            }}
          >
            <Icon size={18} />
            <span>
              {item.id === 'design'
                ? t('Design')
                : item.id === 'notes'
                  ? t('Notes')
                  : t(item.name)}
            </span>
            <PresenceAvatars
              limit={1}
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
      </nav>
      <details ref={actionsMenu} className="workspace-actions-menu">
        <summary
          aria-label={t('Workspace actions')}
          title={t('Workspace actions')}
        >
          <MoreHorizontal size={19} />
        </summary>
        <div className="workspace-actions-popover" onClick={dismissActionsMenu}>
          <span className="overflow-group-label">{t('Workspace')}</span>
          <button onClick={openTeamActivity}>
            <ActivityIcon size={16} />
            {t('Team activity')}
          </button>
          <button onClick={() => setModal('agents')}>
            <Workflow size={16} />
            {t('Agent access')}
          </button>
          <ThemePicker />
          <LanguagePicker />
          <InstallApp />
          <span className="overflow-group-label">{t('Tools')}</span>
          <button onClick={() => void loadHistory()}>
            <History size={16} />
            {t('Revision history')}
          </button>
          <button onClick={() => importRef.current?.click()}>
            <Upload size={16} />
            {t('Import workspace')}
          </button>
          <button onClick={exportWorkspace}>
            <Download size={16} />
            {t('Export workspace')}
          </button>
        </div>
      </details>
    </div>
  )
}
