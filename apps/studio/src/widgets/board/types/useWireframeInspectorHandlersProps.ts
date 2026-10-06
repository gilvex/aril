export type WireframeInspectorHandlersProps = {
  setInspectorOpen: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['inspectorPreference']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['inspectorPreference'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['inspectorPreference']),
  ) => void
  inspectorToggle: import('react').RefObject<HTMLButtonElement | null>
}
