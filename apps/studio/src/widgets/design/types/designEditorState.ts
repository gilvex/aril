import type { DesignElement } from '@pomegranate/domain/design'
import type { DesignDockEdge } from './designDockEdge.ts'
export type DesignEditorState = {
  mobileToolsTab: 'layers' | 'library' | 'properties'
  leftTab: 'layers' | 'library'
  libraryView: 'canvas' | 'variables' | 'machine'
  libraryQuery: string
  componentId: string | null
  variantId: string
  machineId: string | null
  machineDrafts: Record<string, { x: number; y: number }>
  machineSelection: { kind: 'state' | 'transition'; id: string } | null
  variableModes: Record<string, string>
  libraryCollectionId: string
  libraryModeDraft: string
  libraryError: string
  simulation:
    import('@pomegranate/domain/designLibrary').DesignSimulation | null
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
