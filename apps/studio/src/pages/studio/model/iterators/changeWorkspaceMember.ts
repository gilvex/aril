import { call, put } from 'redux-saga/effects'
import type { SagaIterator } from 'redux-saga'
import { request, workspaceHeaders } from '@/shared/api/index.ts'
import { settingsSlice } from '../slices/settingsSlice.ts'
import { loadWorkspaceMembers } from './loadWorkspaceMembers.ts'
export function* changeWorkspaceMember(
  workspaceId: string,
  action: ReturnType<typeof settingsSlice.actions.changeMember>,
): SagaIterator {
  yield put(settingsSlice.actions.changed({ busy: true, error: '' }))
  try {
    yield call(
      request,
      `/api/members/${encodeURIComponent(action.payload.id)}`,
      {
        method: action.payload.role ? 'PATCH' : 'DELETE',
        headers: {
          ...workspaceHeaders(workspaceId),
          'Content-Type': 'application/json',
        },
        body: action.payload.role
          ? JSON.stringify({ role: action.payload.role })
          : undefined,
      },
    )
    yield put(settingsSlice.actions.changed({ confirming: null }))
    yield call(loadWorkspaceMembers, workspaceId)
  } catch (error) {
    yield put(
      settingsSlice.actions.changed({
        error:
          error instanceof Error ? error.message : 'Could not update access.',
      }),
    )
  } finally {
    yield put(settingsSlice.actions.changed({ busy: false }))
  }
}
