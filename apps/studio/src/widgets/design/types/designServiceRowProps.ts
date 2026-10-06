export type DesignServiceRowProps = {
  name: string
  selected: string[]
  setSelected: (
    value:
      | import('../types/designBoardState.ts').DesignBoardState['selected']
      | ((
          current: import('../types/designBoardState.ts').DesignBoardState['selected'],
        ) => import('../types/designBoardState.ts').DesignBoardState['selected']),
  ) => void
  t: import('i18next').TFunction<'translation', undefined>
  index: number
}
