import { useCallback } from 'react'
import { Plus, X, House } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceTabs } from '../model/useWorkspaceTabs.ts'
import { focusWorkspaceTab } from '../utils/index.ts'
import type { StudioHeaderProps } from '../types/studioHeaderProps.ts'
import type { StudioSummary } from '@pomegranate/domain/studios'
export function StudioWorkspaceTabs(props: StudioHeaderProps) {
  const { t } = useTranslation()
  const { tabs, close } = useWorkspaceTabs(
    props.studio,
    props.multiplayer.profile.id,
    props.active,
  )
  const ready = useCallback(async () => {
    if (await props.state.flush()) return true
    props.setNotice(
      t(
        'Finish saving or resolve your unsaved edits before switching workspaces.',
      ),
    )
    return false
  }, [props, t])
  const open = useCallback(
    async (tab: StudioSummary) => {
      if (tab.id !== props.studio.id && (await ready()))
        props.onOpenWorkspace(tab)
    },
    [props, ready],
  )
  const home = useCallback(async () => {
    if (await ready()) props.onWorkspaces(props.multiplayer.profile)
  }, [props, ready])
  const closeTab = useCallback(
    async (id: string) => {
      if (id !== props.studio.id) {
        close(id)
        props.onCloseWorkspace?.(id)
        return
      }
      if (!(await ready())) return
      const index = tabs.findIndex((tab) => tab.id === id)
      const next = tabs[index - 1] || tabs[index + 1]
      close(id)
      props.onCloseWorkspace?.(id)
      if (next) props.onOpenWorkspace(next)
      else props.onWorkspaces(props.multiplayer.profile)
    },
    [close, props, ready, tabs],
  )
  return (
    <div className="studio-workspace-tabs">
      <button
        className="icon-button"
        title={t('Workspaces')}
        aria-label={t('Workspaces')}
        onClick={home}
      >
        <House size={17} />
      </button>
      <div
        className="workspace-tab-list"
        role="tablist"
        onKeyDown={focusWorkspaceTab}
        aria-label={t('Open workspaces')}
      >
        {tabs.map((tab) => (
          <div
            className={`workspace-tab${tab.id === props.studio.id ? ' active' : ''}`}
            key={tab.id}
          >
            <button
              role="tab"
              aria-selected={tab.id === props.studio.id}
              tabIndex={tab.id === props.studio.id ? 0 : -1}
              onClick={() => void open(tab)}
              title={tab.name}
            >
              <img src="/aril.svg" alt="" />
              <span>{tab.name}</span>
            </button>
            <button
              className="workspace-tab-close"
              aria-label={t('Close workspace tab', { name: tab.name })}
              onClick={() => void closeTab(tab.id)}
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
      <button
        className="icon-button"
        title={t('Open workspace')}
        aria-label={t('Open workspace')}
        onClick={() => props.setModal('workspaces')}
      >
        <Plus size={17} />
      </button>
    </div>
  )
}
