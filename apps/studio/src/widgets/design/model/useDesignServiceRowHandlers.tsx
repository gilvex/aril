import { useCallback } from 'react'

import type { DesignServiceRowHandlersProps } from '../types/useDesignServiceRowHandlersProps.ts'
export function useDesignServiceRowHandlers({
  setSelected,
  selected,
  name,
}: DesignServiceRowHandlersProps) {
  const handleChange = useCallback<
    (e: import('react').ChangeEvent<HTMLInputElement, HTMLInputElement>) => void
  >(
    (e) =>
      setSelected(
        e.target.checked
          ? [...selected, name]
          : selected.filter((n) => n !== name),
      ),
    [setSelected, selected, name],
  )
  return { handleChange }
}
