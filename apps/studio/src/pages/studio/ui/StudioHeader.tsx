import { StudioHeaderActions } from './StudioHeaderActions.tsx'
import { StudioWorkspaceTabs } from './StudioWorkspaceTabs.tsx'
import type { StudioHeaderProps } from '../types/studioHeaderProps.ts'
export function StudioHeader(props: StudioHeaderProps) {
  return (
    <header
      className="topbar workspace-tabs-bar"
      inert={props.compact && props.sidebarOpen}
    >
      <StudioWorkspaceTabs {...props} />
      <StudioHeaderActions {...props} />
    </header>
  )
}
