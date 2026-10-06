export type WireframeViewActionsProps = {
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
}
