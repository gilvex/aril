import type { Workspace } from '@pomegranate/domain/workspace'
import type {
  DesignLibrary,
  DesignComponent,
} from '@pomegranate/domain/designLibrary'
import type { DesignPage, DesignElement } from '@pomegranate/domain/design'
import type { useDesignEditorState } from '../model/useDesignEditorState.ts'
export type UseDesignLibraryProps = {
  design: Workspace['design']
  update: (design: Workspace['design']) => void
  library: DesignLibrary
  state: ReturnType<typeof useDesignEditorState>
  page: DesignPage
  selected: DesignElement[]
  component?: DesignComponent
  variant?: DesignPage
}
