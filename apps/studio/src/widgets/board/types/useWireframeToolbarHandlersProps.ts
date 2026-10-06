export type WireframeToolbarHandlersProps = {
  setPreview: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['preview']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['preview'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['preview']),
  ) => void
  preview: boolean
  setPalette: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['palette']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['palette'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['palette']),
  ) => void
}
