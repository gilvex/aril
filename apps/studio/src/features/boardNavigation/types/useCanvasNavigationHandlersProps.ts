export type CanvasNavigationHandlersProps = {
  setOpen: (
    value:
      | import('../types').CanvasNavigationState['open']
      | ((
          current: import('../types').CanvasNavigationState['open'],
        ) => import('../types').CanvasNavigationState['open']),
  ) => void
  open: boolean
  setRenaming: (
    value:
      | import('../types').CanvasNavigationState['renaming']
      | ((
          current: import('../types').CanvasNavigationState['renaming'],
        ) => import('../types').CanvasNavigationState['renaming']),
  ) => void
  onNew: () => void
  name: string
  onRename: (name: string) => void
  toggle: import('react').RefObject<HTMLButtonElement | null>
  setName: (
    value:
      | import('../types').CanvasNavigationState['name']
      | ((
          current: import('../types').CanvasNavigationState['name'],
        ) => import('../types').CanvasNavigationState['name']),
  ) => void
  board: import('@pomegranate/domain/workspace').Board
  onDelete: () => void
}
