import { selectStudio } from '@/pages/studio/model/selectors/selectStudio.ts'
import { studioSlice } from '@/pages/studio/model/slices/studioSlice.ts'
import type { StudioState } from '@/pages/studio/types/studioState.ts'
import { configureStore } from '@reduxjs/toolkit'

export function createStudioModel(initial: StudioState) {
  const store = configureStore({
    reducer: studioSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectStudio(store.getState())
  const actions = {
    setView: (
      value:
        | StudioState['view']
        | ((current: StudioState['view']) => StudioState['view']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().view) : value
      store.dispatch(studioSlice.actions.setView(next))
    },
    setCanvasMode: (
      value:
        | StudioState['canvasMode']
        | ((current: StudioState['canvasMode']) => StudioState['canvasMode']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().canvasMode) : value
      store.dispatch(studioSlice.actions.setCanvasMode(next))
    },
    setBoardId: (
      value:
        | StudioState['boardId']
        | ((current: StudioState['boardId']) => StudioState['boardId']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().boardId) : value
      store.dispatch(studioSlice.actions.setBoardId(next))
    },
    setRequirementId: (
      value:
        | StudioState['requirementId']
        | ((
            current: StudioState['requirementId'],
          ) => StudioState['requirementId']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().requirementId) : value
      store.dispatch(studioSlice.actions.setRequirementId(next))
    },
    setSidebarOpen: (
      value:
        | StudioState['sidebarOpen']
        | ((current: StudioState['sidebarOpen']) => StudioState['sidebarOpen']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().sidebarOpen) : value
      store.dispatch(studioSlice.actions.setSidebarOpen(next))
    },
    setCollaborationPanel: (
      value:
        | StudioState['collaborationPanel']
        | ((
            current: StudioState['collaborationPanel'],
          ) => StudioState['collaborationPanel']),
    ) => {
      const next =
        typeof value === 'function'
          ? value(getSnapshot().collaborationPanel)
          : value
      store.dispatch(studioSlice.actions.setCollaborationPanel(next))
    },
    setNotice: (
      value:
        | StudioState['notice']
        | ((current: StudioState['notice']) => StudioState['notice']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().notice) : value
      store.dispatch(studioSlice.actions.setNotice(next))
    },
    setModal: (
      value:
        | StudioState['modal']
        | ((current: StudioState['modal']) => StudioState['modal']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().modal) : value
      store.dispatch(studioSlice.actions.setModal(next))
    },
    setBoardName: (
      value:
        | StudioState['boardName']
        | ((current: StudioState['boardName']) => StudioState['boardName']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().boardName) : value
      store.dispatch(studioSlice.actions.setBoardName(next))
    },
    setPendingImport: (
      value:
        | StudioState['pendingImport']
        | ((
            current: StudioState['pendingImport'],
          ) => StudioState['pendingImport']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().pendingImport) : value
      store.dispatch(studioSlice.actions.setPendingImport(next))
    },
    setSnapshots: (
      value:
        | StudioState['snapshots']
        | ((current: StudioState['snapshots']) => StudioState['snapshots']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().snapshots) : value
      store.dispatch(studioSlice.actions.setSnapshots(next))
    },
    setHistoryLoading: (
      value:
        | StudioState['historyLoading']
        | ((
            current: StudioState['historyLoading'],
          ) => StudioState['historyLoading']),
    ) => {
      const next =
        typeof value === 'function'
          ? value(getSnapshot().historyLoading)
          : value
      store.dispatch(studioSlice.actions.setHistoryLoading(next))
    },
    setFollowId: (
      value:
        | StudioState['followId']
        | ((current: StudioState['followId']) => StudioState['followId']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().followId) : value
      store.dispatch(studioSlice.actions.setFollowId(next))
    },
  }
  return { store, getSnapshot, actions }
}
