import { useCallback } from 'react'

import type { CanvasChromeHandlersProps } from '../types/useCanvasChromeHandlersProps.ts'
export function useCanvasChromeHandlers({
  onTool,
  compact,
  onMultiSelect,
  multiSelect,
}: CanvasChromeHandlersProps) {
  const handleClick = useCallback<() => void>(() => {
    onTool('select')
    if (compact) onMultiSelect(!multiSelect)
  }, [onTool, compact, onMultiSelect, multiSelect])
  return { handleClick }
}
