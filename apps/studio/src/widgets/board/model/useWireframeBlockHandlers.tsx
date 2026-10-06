import { useCallback } from 'react'

import type { WireframeBlockHandlersProps } from '../types/useWireframeBlockHandlersProps.ts'
export function useWireframeBlockHandlers({
  data,
}: WireframeBlockHandlersProps) {
  const handleClick = useCallback<
    (event: import('react').MouseEvent<HTMLButtonElement, MouseEvent>) => void
  >(
    (event) => {
      event.stopPropagation()
      data.follow?.()
    },
    [data],
  )
  return { handleClick }
}
