export type BlueprintViewActionsProps = {
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
}
