import type { Idea } from '@pomegranate/domain/workspace'

export type BlueprintToolbarProps = {
  navigation: import('react').ReactNode
  tool: import('../types/canvasTool.ts').CanvasTool
  setTool: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['tool']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['tool'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['tool']),
  ) => void
  touchSelection: boolean
  setTouchSelection: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['touchSelection']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['touchSelection'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['touchSelection']),
  ) => void
  inspectorToggle: import('react').RefObject<HTMLButtonElement | null>
  inspectorOpen: boolean
  setInspectorOpen: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['inspectorPreference']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['inspectorPreference'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['inspectorPreference']),
  ) => void
  fullscreenButtonRef: import('react').RefObject<HTMLButtonElement | null>
  fullscreen: boolean
  toggleFullscreen: () => Promise<void>
  setPalette: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['palette']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['palette'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['palette']),
  ) => void
  palette: boolean
  addNode: (kind: Idea['data']['kind'], at?: { x: number; y: number }) => void
}
