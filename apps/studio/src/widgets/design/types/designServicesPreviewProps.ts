export type DesignServicesPreviewProps = {
  t: import('i18next').TFunction<'translation', undefined>
  selected: string[]
  setSelected: (
    value:
      | import('../types/designBoardState.ts').DesignBoardState['selected']
      | ((
          current: import('../types/designBoardState.ts').DesignBoardState['selected'],
        ) => import('../types/designBoardState.ts').DesignBoardState['selected']),
  ) => void
}
