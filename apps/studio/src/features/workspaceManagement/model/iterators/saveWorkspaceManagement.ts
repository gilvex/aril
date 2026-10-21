import { call, put, select } from 'redux-saga/effects'
import type { SagaIterator } from 'redux-saga'
import type { StudioSummary } from '@aril/domain/studios'
import type { WorkspaceManagementState } from '../../types/workspaceManagementState.ts'
import { workspaceManagementSlice } from '../slices/workspaceManagementSlice.ts'
import { requestWorkspaceChange } from '@/entities/studio/index.ts'

export function* saveWorkspaceManagement(
  beforeSave: () => Promise<boolean>,
): SagaIterator<StudioSummary | null | undefined> {
  const { management, name, busy }: WorkspaceManagementState = yield select()
  if (!management || busy || management.studio.role !== 'owner') return
  if (
    management.mode === 'delete'
      ? name !== management.studio.name
      : !name.trim()
  )
    return
  const { changed } = workspaceManagementSlice.actions
  yield put(changed({ busy: true, error: '' }))
  try {
    const saved: boolean = yield call(beforeSave)
    if (!saved)
      throw new Error(
        'Save your pending changes before managing this workspace.',
      )
    yield call(requestWorkspaceChange, management, name)
    yield put(changed({ management: null }))
    return management.mode === 'delete'
      ? null
      : { ...management.studio, name: name.trim() }
  } catch (error) {
    yield put(
      changed({
        error:
          error instanceof Error
            ? error.message
            : 'Could not update workspace.',
      }),
    )
  } finally {
    yield put(changed({ busy: false }))
  }
}
