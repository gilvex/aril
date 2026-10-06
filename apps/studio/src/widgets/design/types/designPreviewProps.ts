export type DesignPreviewProps = {
  design: {
    accent: string
    density: 'Comfortable' | 'Compact'
    direction: string
  }
  tab: string
  setTab: (
    value:
      | import('../types/designBoardState.ts').DesignBoardState['tab']
      | ((
          current: import('../types/designBoardState.ts').DesignBoardState['tab'],
        ) => import('../types/designBoardState.ts').DesignBoardState['tab']),
  ) => void
  selected: string[]
  setSelected: (
    value:
      | import('../types/designBoardState.ts').DesignBoardState['selected']
      | ((
          current: import('../types/designBoardState.ts').DesignBoardState['selected'],
        ) => import('../types/designBoardState.ts').DesignBoardState['selected']),
  ) => void
}
