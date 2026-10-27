import type { Idea } from '@aril/domain/workspace'
export type BlueprintIconPickerProps = {
  node: Idea
  readOnly: boolean
  updateNode: (data: Partial<Idea['data']>) => void
}
