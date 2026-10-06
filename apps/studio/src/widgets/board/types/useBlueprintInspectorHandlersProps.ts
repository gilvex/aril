export type BlueprintInspectorHandlersProps = {
  setInspectorOpen: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['inspectorPreference']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['inspectorPreference'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['inspectorPreference']),
  ) => void
  inspectorToggle: import('react').RefObject<HTMLButtonElement | null>
}
