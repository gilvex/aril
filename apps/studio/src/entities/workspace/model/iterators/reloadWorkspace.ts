import { fetchWorkspace } from '@/entities/workspace/model/requests/fetchWorkspace.ts'
import type { WorkspaceRuntime } from '@/entities/workspace/types/workspaceRuntime.ts'
import { keepViews } from '@/entities/workspace/utils/keepViews.ts'
import type { Envelope } from '@pomegranate/domain/workspace'
import type { SagaIterator } from 'redux-saga'
import { call } from 'redux-saga/effects'
export function* reloadWorkspace(
  runtime: WorkspaceRuntime,
): SagaIterator<void> {
  const {
    base,
    blocked,
    deferred,
    current,
    publish,
    setRevision,
    undoStack,
    redoStack,
    persistDraft,
    setSaveState,
    setError,
    setHistoryVersion,
    workspaceId,
  } = runtime

  try {
    const latest: Envelope = yield call(fetchWorkspace, workspaceId)
    base.current = latest
    blocked.current = false
    deferred.current = null
    publish(keepViews(latest.workspace, current.current))
    setRevision(latest.revision)
    undoStack.current = []
    redoStack.current = []
    persistDraft()
    setSaveState('saved')
    setError('')
    setHistoryVersion()
  } catch (err) {
    setError(String(err))
  }
}
