import { useCallback } from 'react'

import type { WireframeToolbarHandlersProps } from '../types/useWireframeToolbarHandlersProps.ts'
export function useWireframeToolbarHandlers({
  setPreview,
  preview,
  setPalette,
}: WireframeToolbarHandlersProps) {
  const handleClick = useCallback<() => void>(() => {
    setPreview(!preview)
    setPalette(false)
  }, [setPreview, preview, setPalette])
  return { handleClick }
}
