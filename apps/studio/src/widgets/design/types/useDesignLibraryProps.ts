import type { Workspace } from '@aril/domain/workspace'
import type { DesignLibrary, DesignComponent } from '@aril/domain/designLibrary'
import type { DesignPage, DesignElement } from '@aril/domain/design'
import type { useDesignEditorState } from '../model/useDesignEditorState.ts'
export type UseDesignLibraryProps = {
  navigateDesign: (
    state: Partial<import('./designEditorState.ts').DesignEditorState>,
  ) => void
  openLibrary: (tab?: 'graph' | 'variables') => void
  design: Workspace['design']
  update: (design: Workspace['design']) => void
  library: DesignLibrary
  state: ReturnType<typeof useDesignEditorState>
  page: DesignPage
  selected: DesignElement[]
  component?: DesignComponent
  variant?: DesignPage
}
