import { commitWorkspace } from '@/entities/workspace/model/requests/commitWorkspace.ts'
import { fetchWorkspace } from '@/entities/workspace/model/requests/fetchWorkspace.ts'
import type { WorkspaceRuntime } from '@/entities/workspace/types/workspaceRuntime.ts'
import { keepViews } from '@/entities/workspace/utils/keepViews.ts'
import { ApiError } from '@/shared/api/apiError.ts'
import {
  applyOperations,
  diffWorkspace,
  MergeConflict,
} from '@pomegranate/domain/collaboration'
import { canRebaseOperations } from '@pomegranate/domain/freshness'
import type { Envelope } from '@pomegranate/domain/workspace'
import type { SagaIterator } from 'redux-saga'
import { call } from 'redux-saga/effects'
export function* flushWorkspace(
  runtime: WorkspaceRuntime,
): SagaIterator<boolean> {
  const {
    saving,
    blocked,
    base,
    current,
    deferred,
    setSaveState,
    persistDraft,
    setError,
    workspaceId,
    publish,
    setRevision,
    receive,
  } = runtime

  if (saving.current || blocked.current) return false
  let operations = diffWorkspace(base.current.workspace, current.current)
  if (!operations.length) {
    setSaveState('saved')
    persistDraft()
    return true
  }
  saving.current = true
  setSaveState('saving')
  setError('')
  try {
    let retries = 0
    while (operations.length) {
      const sent = structuredClone(current.current)
      let result: Envelope
      try {
        result = yield call(
          commitWorkspace,
          workspaceId,
          base.current.revision,
          operations,
        )
      } catch (err) {
        // Only current-session, non-deleting edits may rebase after a race.
        // A stale deletion or replacement must be reviewed by the user.
        if (
          err instanceof ApiError &&
          err.code === 'STALE_REVISION' &&
          retries++ < 3 &&
          canRebaseOperations(operations)
        ) {
          const latest: Envelope = yield call(fetchWorkspace, workspaceId)
          const rebased = applyOperations(latest.workspace, operations)
          const additional = diffWorkspace(sent, current.current)
          if (!canRebaseOperations(additional))
            throw new MergeConflict(['stale removal'])
          const next = applyOperations(rebased, additional)
          base.current = latest
          publish(keepViews(next, current.current))
          setRevision(latest.revision)
          persistDraft()
          operations = diffWorkspace(latest.workspace, next)
          continue
        }
        throw err
      }
      const newerLocalEdits = diffWorkspace(sent, current.current)
      const next = keepViews(
        applyOperations(result.workspace, newerLocalEdits),
        current.current,
      )
      base.current = result
      publish(next)
      setRevision(result.revision)
      persistDraft()
      operations = diffWorkspace(base.current.workspace, current.current)
    }
    setSaveState('saved')
    return true
  } catch (err) {
    if (
      err instanceof MergeConflict ||
      (err instanceof ApiError && [409, 428].includes(err.status))
    )
      blocked.current = true
    setError(err instanceof Error ? err.message : 'Save failed.')
    setSaveState('error')
    persistDraft()
    return false
  } finally {
    saving.current = false
    if (deferred.current && !blocked.current) {
      const latest = deferred.current
      deferred.current = null
      receive(latest)
    }
  }
}
