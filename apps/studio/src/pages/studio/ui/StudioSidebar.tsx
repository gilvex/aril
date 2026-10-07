import { PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { StudioDesktopNavigation } from './StudioDesktopNavigation.tsx'
import type { StudioContentProps } from '../types/studioContentProps.ts'
export function StudioSidebar(props: StudioContentProps) {
  const { t } = useTranslation()
  return (
    <aside
      className={`studio-navigation-sidebar${props.navigationCollapsed ? ' collapsed' : ''}`}
      aria-label={t('Workspace navigation')}
    >
      <header>
        <img src="/aril.svg" alt="" />
        <strong title={props.studio.name}>{props.studio.name}</strong>
      </header>
      <StudioDesktopNavigation {...props} />
      <button
        className="sidebar-collapse-control"
        aria-current={props.view === 'settings' ? 'page' : undefined}
        title={t('Settings')}
        onClick={() => props.setView('settings')}
      >
        <Settings size={18} />
        <span>{t('Settings')}</span>
      </button>
      <button
        className="sidebar-collapse-control"
        title={t(
          props.navigationCollapsed ? 'Expand sidebar' : 'Collapse sidebar',
        )}
        aria-label={t(
          props.navigationCollapsed ? 'Expand sidebar' : 'Collapse sidebar',
        )}
        onClick={() => props.setNavigationCollapsed(!props.navigationCollapsed)}
      >
        {props.navigationCollapsed ? (
          <PanelLeftOpen size={18} />
        ) : (
          <PanelLeftClose size={18} />
        )}
        <span>{t('Collapse sidebar')}</span>
      </button>
    </aside>
  )
}
