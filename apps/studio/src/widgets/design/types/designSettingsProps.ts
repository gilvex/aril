export type DesignSettingsProps = {
  colors: string[]
  update: (
    design: import('@pomegranate/domain/workspace').Workspace['design'],
  ) => void
  design: {
    accent: string
    density: 'Comfortable' | 'Compact'
    direction: string
  }
}
