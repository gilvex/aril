import {
  applyOperations,
  equal,
  type Operation,
  type Json,
} from '@pomegranate/domain/collaboration'
import { documentOf } from '@pomegranate/domain/collaboration'
import type { Workspace } from '@pomegranate/domain/workspace'
import type { LiveFieldPreview } from '../types/liveFieldPreview.ts'
import { isLiveFieldOperation } from '@pomegranate/domain/liveSession'
import { keepViews } from './keepViews.ts'
export function projectLiveFields(
  workspace: Workspace,
  previews: Record<string, LiveFieldPreview>,
) {
  let next = workspace
  for (const preview of Object.values(previews).sort((a, b) =>
    a.id.localeCompare(b.id),
  )) {
    if (!preview.operations.length) continue
    const document = documentOf(next)
    const applicable = (preview.operations as Operation[]).filter(
      (operation) => {
        if (!isLiveFieldOperation(operation)) return false
        let value: Json | undefined = document
        for (const part of operation.path) {
          if (
            !value ||
            typeof value !== 'object' ||
            Array.isArray(value) ||
            !Object.hasOwn(value, part)
          ) {
            value = undefined
            break
          }
          value = value[part]
        }
        return !equal(value, operation.after) && equal(value, operation.before)
      },
    )
    if (!applicable.length) continue
    try {
      next = keepViews(applyOperations(next, applicable), next)
    } catch {
      // Invalid or structurally stale previews never replace a valid local document.
    }
  }
  return next
}
