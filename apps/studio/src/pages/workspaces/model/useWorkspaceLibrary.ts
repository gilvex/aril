import { useCallback, useMemo } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { readWorkspaceVisits } from '@/shared/utils/readWorkspaceVisits.ts'
import { createWorkspaceHomeState } from './createWorkspaceHomeState.ts'
import { useWorkspaceHomeModel } from './useWorkspaceHomeModel.ts'
import { useWorkspaceHomeHandlers } from './useWorkspaceHomeHandlers.tsx'
import { sortWorkspaces } from '../utils/sortWorkspaces.ts'
import type { WorkspaceHomeProps } from '../types/workspaceHomeProps.ts'

export function useWorkspaceLibrary({ profile, onOpen }: WorkspaceHomeProps) {
  const { t, i18n } = useTranslation()
  const state = useWorkspaceHomeModel(createWorkspaceHomeState)
  const { studios, search, sort, setError, setCreating, openHostedWorkspace } =
    state
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
  return { t, state, visits, visible, handleSubmit, create, openHosted }
}
