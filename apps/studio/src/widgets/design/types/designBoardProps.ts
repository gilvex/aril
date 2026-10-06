import type { Workspace } from '@pomegranate/domain/workspace'
export type DesignBoardProps = {
  design: Workspace['design']
  update: (design: Workspace['design']) => void
}
