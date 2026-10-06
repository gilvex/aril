export type DesignBoardState = {
  tab: string
  selected: string[]
  device: 'desktop' | 'mobile'
  theme: 'light' | 'dark'
  inspector: boolean
  query: string
  notice: string
}
