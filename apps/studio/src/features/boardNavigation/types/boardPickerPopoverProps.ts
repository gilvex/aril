export type BoardPickerPopoverProps = {
  t: import('i18next').TFunction<'translation', undefined>
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
  createBoard: () => void
  renaming: boolean
  renameBoard: (e: import('react').SubmitEvent<HTMLFormElement>) => void
  name: string
  setName: (
    value:
      | import('../types/canvasNavigationState.ts').CanvasNavigationState['name']
      | ((
          current: import('../types/canvasNavigationState.ts').CanvasNavigationState['name'],
        ) => import('../types/canvasNavigationState.ts').CanvasNavigationState['name']),
  ) => void
  beginRenaming: () => void
  deleteBoard: () => void
}
