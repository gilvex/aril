export type BoardPickerListProps = {
  boards: import('@pomegranate/domain/workspace').Board[]
  board: import('@pomegranate/domain/workspace').Board
  onBoard: (id: string) => void
  setOpen: (
    value:
      | import('../types/canvasNavigationState.ts').CanvasNavigationState['open']
      | ((
          current: import('../types/canvasNavigationState.ts').CanvasNavigationState['open'],
        ) => import('../types/canvasNavigationState.ts').CanvasNavigationState['open']),
  ) => void
  present: Pick<
    import('@pomegranate/domain/collaboration').Presence,
    'profile' | 'view' | 'boardId'
  >[]
}
