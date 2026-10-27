import { Text } from '@/shared/ui/Text.tsx'
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
            <Text as="span">
              {item.id === 'design'
                ? t('Design')
                : item.id === 'notes'
                  ? t('Notes')
                  : t(item.name)}
            </Text>
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
        <Text
          as="summary"
          aria-label={t('Workspace actions')}
          title={t('Workspace actions')}
        >
          <MoreHorizontal size={19} />
        </Text>
        <div className="workspace-actions-popover" onClick={dismissActionsMenu}>
          <Text as="span" className="overflow-group-label">
            {t('Workspace')}
          </Text>
          <button onClick={openTeamActivity}>
            <ActivityIcon size={16} />
            <Text>{t('Team activity')}</Text>
          </button>
          <button onClick={() => setModal('agents')}>
            <Workflow size={16} />
            <Text>{t('Agent access')}</Text>
          </button>
          <ThemePicker />
          <LanguagePicker />
          <InstallApp />
          <Text as="span" className="overflow-group-label">
            {t('Tools')}
          </Text>
          <button onClick={() => void loadHistory()}>
            <History size={16} />
            <Text>{t('Revision history')}</Text>
          </button>
          <button onClick={() => importRef.current?.click()}>
            <Upload size={16} />
            <Text>{t('Import workspace')}</Text>
          </button>
          <button onClick={exportWorkspace}>
            <Download size={16} />
            <Text>{t('Export workspace')}</Text>
          </button>
        </div>
      </details>
    </div>
  )
}
