import type { RefObject } from 'react'
import type { BlueprintOverviewProps } from './blueprintOverviewProps.ts'
export type BoardOverviewActionsProps = Pick<
  BlueprintOverviewProps,
  'board' | 'addNode' | 'fitBoard'
> & {
  rename: () => void
  canEdit: boolean
  titleRef: RefObject<HTMLInputElement | null>
}
