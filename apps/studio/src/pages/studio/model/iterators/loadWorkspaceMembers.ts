import { call, put } from 'redux-saga/effects'
import type { SagaIterator } from 'redux-saga'
import type { WorkspaceMember } from '@pomegranate/domain/studios'
import { request, workspaceHeaders } from '@/shared/api/index.ts'
import { settingsSlice } from '../slices/settingsSlice.ts'
export function* loadWorkspaceMembers(workspaceId: string): SagaIterator {
  yield put(settingsSlice.actions.changed({ loading: true, error: '' }))
  try {
    const members: WorkspaceMember[] = yield call(request, '/api/members', {
      headers: workspaceHeaders(workspaceId),
    })
    yield put(settingsSlice.actions.changed({ members }))
  } catch (error) {
    yield put(
      settingsSlice.actions.changed({
        error:
          error instanceof Error ? error.message : 'Could not load members.',
      }),
    )
  } finally {
    yield put(settingsSlice.actions.changed({ loading: false }))
  }
}
