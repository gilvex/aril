import type { CanvasInsertPoint } from '@/widgets/board/types/canvasInsertPoint.ts'
import { type WireKind } from '@pomegranate/domain/wireframe'

export type WireframeToolbarProps = {
  navigation: import('react').ReactNode
  tool: import('../types/canvasTool.ts').CanvasTool
  setTool: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['tool']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['tool'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['tool']),
  ) => void
  touchSelection: boolean
  setTouchSelection: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['touchSelection']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['touchSelection'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['touchSelection']),
  ) => void
  preview: boolean
  inspectorToggle: import('react').RefObject<HTMLButtonElement | null>
  inspectorOpen: boolean
  setInspectorOpen: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['inspectorPreference']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['inspectorPreference'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['inspectorPreference']),
  ) => void
  full: import('../../../features/canvasFullscreen/index.ts').CanvasFullscreenControls
  setPreview: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['preview']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['preview'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['preview']),
  ) => void
  setPalette: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['palette']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['palette'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['palette']),
  ) => void
  palette: boolean
  graph: import('@pomegranate/domain/wireframe').Wireframe
  add: (kind: WireKind, at?: CanvasInsertPoint) => void
}
