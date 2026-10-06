export type WireframePaletteProps = {
  t: import('i18next').TFunction<'translation', undefined>
  setPalette: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['palette']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['palette'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['palette']),
  ) => void
  add: (
    kind: import('@pomegranate/domain/wireframe').WireKind,
    at?: import('../types/canvasInsertPoint.ts').CanvasInsertPoint,
  ) => void
}
