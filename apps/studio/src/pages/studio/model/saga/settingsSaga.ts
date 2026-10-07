import { fork, takeLatest, takeLeading } from 'redux-saga/effects'
import { watchWorkspaceAccess } from '../iterators/watchWorkspaceAccess.ts'
import { loadWorkspaceMembers } from '../iterators/loadWorkspaceMembers.ts'
import { changeWorkspaceMember } from '../iterators/changeWorkspaceMember.ts'
import { settingsSlice } from '../slices/settingsSlice.ts'
export function* settingsSaga(workspaceId: string) {
  yield fork(watchWorkspaceAccess, workspaceId)
  yield fork(loadWorkspaceMembers, workspaceId)
  yield takeLatest(
    settingsSlice.actions.loadMembers.type,
    loadWorkspaceMembers,
    workspaceId,
  )
  yield takeLeading(
    settingsSlice.actions.changeMember.type,
    changeWorkspaceMember,
    workspaceId,
  )
}
