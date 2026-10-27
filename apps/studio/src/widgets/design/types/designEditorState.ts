import type { DesignElement } from '@aril/domain/design'
import type { DesignDockEdge } from './designDockEdge.ts'
import type { DesignDockRect } from './designDockRect.ts'
export type DesignEditorState = {
  mobileToolsTab: 'layers' | 'library' | 'properties'
  leftTab: 'layers' | 'library'
  libraryView: 'canvas' | 'variables' | 'machine'
  libraryQuery: string
  libraryTab: 'graph' | 'variables' | 'browse'
  libraryPath: string[]
  libraryUsage: 'all' | 'used' | 'unused'
  libraryFocus: boolean
  libraryDepth: 1 | 2
  libraryDirection: 'both' | 'uses' | 'usedBy'
  libraryOffset: number
  libraryPositions: Record<string, { x: number; y: number }>
  libraryExpanded: Record<string, number>
  libraryInspectorView: 'details' | 'usage'
  libraryUsageQuery: string
  libraryPreviewVariant: string
  libraryAssetHistory: string[]
  libraryDetailsTab: 'usedBy' | 'uses' | 'impact'
  libraryUsageLimit: number
  variableLimit: number
  libraryKind: 'all' | 'component' | 'variable' | 'machine' | 'page'
  libraryAsset: string | null
  librarySelection: string[]
  libraryDetailsOpen: boolean
  libraryDockScope: 'graph' | 'workspace'
  libraryPanelBounds: {
    workspace: DesignDockRect
    graph: DesignDockRect
  } | null
  panelDockBounds?: DesignDockRect
  panelWorkspaceDock?: boolean
  variableQuery: string
  variableType: string
  variableUsage: 'all' | 'used' | 'unused'
  panelMaximized: 'left' | 'right' | null
  componentId: string | null
  variantId: string
  machineId: string | null
  machineDrafts: Record<string, { x: number; y: number }>
  machineSelection: { kind: 'state' | 'transition'; id: string } | null
  variableModes: Record<string, string>
  libraryCollectionId: string
  libraryModeDraft: string
  libraryError: string
  simulation: import('@aril/domain/designLibrary').DesignSimulation | null
  panelPositions: {
    left: { x: number; y: number } | null
    right: { x: number; y: number } | null
  }
  dockMode: 'split' | 'tabs'
  dockActive: 'left' | 'right'
  dockPreview: { edge: DesignDockEdge; side: 'left' | 'right' } | null
  layerActionsId: string | null
  compact: boolean
  panelSpace: number
  panelVerticalSpace: number
  layersHeight: number
  inspectorHeight: number
  layersDockHeight: number
  inspectorDockHeight: number
  layersWidth: number
  inspectorWidth: number
  layersDocked: DesignDockEdge | null
  inspectorDocked: DesignDockEdge | null
  pageId: string
  selection: string[]
  drafts: Record<string, Partial<DesignElement>>
  tool: 'select' | 'pan'
  pagesOpen: boolean
  pageQuery: string
  layers: boolean
  inspector: boolean
  styles: boolean
  editingId: string | null
  collapsed: string[]
  renamingPageId: string | null
  renameDraft: string
  contextPoint: { x: number; y: number } | null
}
