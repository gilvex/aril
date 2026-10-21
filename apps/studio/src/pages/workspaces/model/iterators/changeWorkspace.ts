import { call, put, select } from 'redux-saga/effects'
import type { SagaIterator } from 'redux-saga'
import type { WorkspaceHomeState } from '../../types/workspaceHomeState.ts'
import { workspaceHomeSlice } from '../slices/workspaceHomeSlice.ts'
import { requestWorkspaceChange } from '@/entities/studio/index.ts'
import { loadStudioList } from './loadStudioList.ts'
export function* changeWorkspace(): SagaIterator {
  const state: WorkspaceHomeState = yield select()
  if (!state.management || state.busy) return
  yield put(workspaceHomeSlice.actions.setBusy(true))
  yield put(workspaceHomeSlice.actions.setError(''))
  try {
    yield call(requestWorkspaceChange, state.management, state.name)
    yield put(
      workspaceHomeSlice.actions.setStudios(
        (state.studios || []).flatMap((studio) =>
          studio.id !== state.management!.studio.id
            ? [studio]
            : state.management!.mode === 'delete'
              ? []
              : [{ ...studio, name: state.name.trim() }],
        ),
      ),
    )
    yield put(workspaceHomeSlice.actions.setManagement(null))
    yield call(loadStudioList, new AbortController().signal)
  } catch (error) {
    yield put(
      workspaceHomeSlice.actions.setError(
        error instanceof Error ? error.message : 'Could not update workspace.',
      ),
    )
  } finally {
    yield put(workspaceHomeSlice.actions.setBusy(false))
  }
}
