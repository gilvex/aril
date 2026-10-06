import { useCallback } from 'react'

import type { WireframeInspectorHandlersProps } from '../types/useWireframeInspectorHandlersProps.ts'
export function useWireframeInspectorHandlers({
  setInspectorOpen,
  inspectorToggle,
}: WireframeInspectorHandlersProps) {
  const handleCloseWireframeDetailsClick = useCallback<() => void>(() => {
    setInspectorOpen(false)
    inspectorToggle.current?.focus()
  }, [setInspectorOpen, inspectorToggle])
  return { handleCloseWireframeDetailsClick }
}
