export type WireframePreviewDetailsProps = {
  previewMessage: string
  node: import('@pomegranate/domain/wireframe').WireNode | undefined
  graph: import('@pomegranate/domain/wireframe').Wireframe
  focus: (id: string) => void
  setPreviewMessage: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['previewMessage']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['previewMessage'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['previewMessage']),
  ) => void
  setPreview: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['preview']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['preview'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['preview']),
  ) => void
}
