export type BoardPickerListProps = {
  boards: import('@aril/domain/workspace').Board[]
  board: import('@aril/domain/workspace').Board
  onBoard: (id: string) => void
  setOpen: (
    value:
      | import('../types/canvasNavigationState.ts').CanvasNavigationState['open']
      | ((
          current: import('../types/canvasNavigationState.ts').CanvasNavigationState['open'],
        ) => import('../types/canvasNavigationState.ts').CanvasNavigationState['open']),
  ) => void
  present: Pick<
    import('@aril/domain/collaboration').Presence,
    'profile' | 'view' | 'boardId'
  >[]
}
