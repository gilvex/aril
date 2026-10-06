import type { Workspace } from '@pomegranate/domain/workspace'
import type { DesignBoardState } from './designBoardState.ts'
export type DesignPreviewProps = DesignBoardState & {
  design: Workspace['design']
  setSelected: (value: string[] | ((current: string[]) => string[])) => void
  patch: (value: Partial<DesignBoardState>) => void
}
