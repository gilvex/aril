import type { Workspace } from '@pomegranate/domain/workspace'
export type DesignSettingsProps = {
  colors: string[]
  update: (design: Workspace['design']) => void
  design: Workspace['design']
  close: () => void
}
