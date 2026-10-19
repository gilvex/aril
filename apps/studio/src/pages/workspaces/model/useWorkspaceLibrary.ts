import { syncWorkspaceTabs } from '@/shared/utils/syncWorkspaceTabs.ts'
import { useCallback, useMemo, useEffect } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { readWorkspaceVisits } from '@/shared/utils/readWorkspaceVisits.ts'
import { createWorkspaceHomeState } from './createWorkspaceHomeState.ts'
import { useWorkspaceHomeModel } from './useWorkspaceHomeModel.ts'
import { useWorkspaceHomeHandlers } from './useWorkspaceHomeHandlers.tsx'
import { sortWorkspaces } from '../utils/sortWorkspaces.ts'
import type { WorkspaceHomeProps } from '../types/workspaceHomeProps.ts'

export function useWorkspaceLibrary({
  profile,
  onOpen,
  onStudiosChanged,
}: WorkspaceHomeProps) {
  const { t, i18n } = useTranslation()
  const state = useWorkspaceHomeModel(createWorkspaceHomeState)
  const {
    studios,
    search,
    sort,
    setError,
    setCreating,
    openHostedWorkspace,
    setManagement,
    changeWorkspace,
    busy,
  } = state
  useEffect(() => {
    if (studios) {
      syncWorkspaceTabs(profile.id, studios)
      onStudiosChanged?.(studios)
    }
  }, [studios, onStudiosChanged, profile.id])
  const visits = useMemo(() => readWorkspaceVisits(profile.id), [profile.id])
  const visible = useMemo(
    () =>
      sortWorkspaces(
        studios || [],
        search,
        sort,
        visits,
        i18n.resolvedLanguage || 'en',
      ),
    [studios, search, sort, visits, i18n.resolvedLanguage],
  )
  const { handleSubmit } = useWorkspaceHomeHandlers({
    createWorkspace: state.createWorkspace,
    name: state.name,
    onOpen,
  })
  const create = useCallback(() => {
    setError('')
    setCreating(true)
  }, [setError, setCreating])
  const openHosted = useCallback(
    () => openHostedWorkspace(),
    [openHostedWorkspace],
  )
  const manage = useCallback(
    (
      studio: import('@aril/domain/studios').StudioSummary,
      mode: 'rename' | 'delete',
    ) => {
      setManagement({ studio, mode })
    },
    [setManagement],
  )
  const closeManagement = useCallback(() => {
    if (!busy) setManagement(null)
  }, [busy, setManagement])
  const submitManagement = useCallback(
    (event: import('react').SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      changeWorkspace()
    },
    [changeWorkspace],
  )
  return {
    manage,
    closeManagement,
    submitManagement,
    t,
    state,
    visits,
    visible,
    handleSubmit,
    create,
    openHosted,
  }
}
