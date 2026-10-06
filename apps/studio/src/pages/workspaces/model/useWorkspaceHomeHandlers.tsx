import { useCallback } from 'react'

import type { WorkspaceHomeHandlersProps } from '../types/useWorkspaceHomeHandlersProps.ts'
export function useWorkspaceHomeHandlers({
  createWorkspace,
  name,
  onOpen,
}: WorkspaceHomeHandlersProps) {
  const handleSubmit = useCallback<
    (event: import('react').SubmitEvent<HTMLFormElement>) => void
  >(
    (event) => {
      event.preventDefault()
      void createWorkspace(name).then((studio) => {
        if (studio) onOpen(studio)
      })
    },
    [createWorkspace, name, onOpen],
  )
  return { handleSubmit }
}
