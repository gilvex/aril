export type DesignServiceRowHandlersProps = {
  setSelected: (
    value:
      | import('../types/designBoardState.ts').DesignBoardState['selected']
      | ((
          current: import('../types/designBoardState.ts').DesignBoardState['selected'],
        ) => import('../types/designBoardState.ts').DesignBoardState['selected']),
  ) => void
  selected: string[]
  name: string
}
