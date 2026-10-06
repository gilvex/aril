import { useCallback } from 'react'

import type { WireframeDimensionInputHandlersProps } from '../types/useWireframeDimensionInputHandlersProps.ts'
export function useWireframeDimensionInputHandlers({
  dimension,
  editNode,
}: WireframeDimensionInputHandlersProps) {
  const handleChange = useCallback<
    (e: import('react').ChangeEvent<HTMLInputElement, HTMLInputElement>) => void
  >(
    (e) => {
      const value = e.target.valueAsNumber
      if (
        Number.isFinite(value) &&
        value >= (dimension === 'width' ? 60 : 32) &&
        value <= 2400
      )
        editNode({ [dimension]: value })
    },
    [dimension, editNode],
  )
  return { handleChange }
}
