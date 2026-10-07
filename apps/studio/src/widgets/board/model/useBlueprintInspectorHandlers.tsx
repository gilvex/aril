import { useCallback } from 'react'

import type { BlueprintInspectorHandlersProps } from '../types/useBlueprintInspectorHandlersProps.ts'
export function useBlueprintInspectorHandlers({
  setInspectorOpen,
  inspectorToggle,
}: BlueprintInspectorHandlersProps) {
  const handleCloseBoardDetailsClick = useCallback<() => void>(() => {
    setInspectorOpen(false)
    requestAnimationFrame(() => inspectorToggle.current?.focus())
  }, [setInspectorOpen, inspectorToggle])
  return { handleCloseBoardDetailsClick }
}
