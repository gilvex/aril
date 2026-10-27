import type { BlueprintIconPickerProps } from './blueprintIconPickerProps.ts'
import type { useIconPickerModel } from '../model/useIconPickerModel.ts'
export type IconLibraryProps = BlueprintIconPickerProps & {
  model: ReturnType<typeof useIconPickerModel>
}
